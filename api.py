#!flask/bin/python
import requests
import re
import unicodedata
from datetime import date, timedelta
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request, render_template
from settings import app, db
from db_models import Place

WOLFRAM_APPID = "7GW5RH-PWP987529Q"
WOLFRAM_BASEURL = "https://api.wolframalpha.com/v1/result"
QUERY_COUNTRY = "In what country is "
QUERY_PROVINCE = "In what province is "
QUERY_POPULATION = "What is the population of "

JOHN_HOPKINS_URL = "https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Nc2JKvYFoAEOFCG5JSI6/FeatureServer/3/query?f=json&where=Country_Region%3D%27Spain%27&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&outSR=102100&resultOffset=0&resultRecordCount=75&resultType=standard&cacheHint=true"

QUANTILE = 0.98

# https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/06-13-2020.csv
yesterday = (date.today() - timedelta(days=2)).strftime('%m-%d-%Y')
week_ago = (date.today() - timedelta(days=7)).strftime('%m-%d-%Y')
JHU_GITHUB = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{yesterday}.csv"
JHU_GITHUB_WEEK = f"https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{week_ago}.csv"
GCP_DATA = "https://storage.googleapis.com/covid19-open-data/v2/latest/main.csv"
POPULATION_CSV = 'world_population.csv'
PROVINCES_CSV = 'provinces.csv'
JHU_TO_GCP = 'jhu_to_gcp.csv'

RISK = {
    'en': {
        'low': 'Low Risk',
        'med': 'Moderate Risk',
        'high': 'High Risk'
    },
    'es': {
        'low': 'Riesgo Bajo',
        'med': 'Riesgo Moderado',
        'high': 'Riesgo Alto'
    }
}

# https://stackoverflow.com/questions/36028759/how-to-open-and-convert-sqlite-database-to-pandas-dataframe
# https://api.wolframalpha.com/v1/result?appid=7GW5RH-PWP987529Q&i=In+what+province+is+zhengzhou%3F

df = pd.read_csv(JHU_GITHUB, index_col='Combined_Key')
df_week = pd.read_csv(JHU_GITHUB_WEEK, index_col='Combined_Key')
df_population = pd.read_csv(POPULATION_CSV, index_col='Country')
df_provinces = pd.read_csv(PROVINCES_CSV, index_col='Wolfram')
df_dict = pd.read_csv(JHU_TO_GCP, index_col='JHU')

# ------------- Nuevo Add GCP Columns to JHU Data ----------------------
df_gcp = pd.read_csv(GCP_DATA)
df_gcp['st_key'] = df_gcp['country_name'] + '_' + df_gcp['subregion1_name']
df['st_key'] = df['Country_Region'] + '_' + df['Province_State']
df['Area'] = np.nan
df['Population'] = np.nan

for key in df['st_key'].unique():
    try:
        gcp_key = df_dict.loc[key]['GCP']
        row_idx = df[df['st_key'] == key]['Area'].index
        raw_data = df_gcp[(df_gcp['st_key'] == gcp_key) & (df_gcp['subregion2_name'].isnull())][['area','population']]
        if raw_data.shape == (1,2):
            data = raw_data.values
        else:
            print("Different Data Shape", gcp_key)
            print(raw_data)
            data = [np.nan, np.nan]
        df.loc[row_idx, ['Area', 'Population']] = data
    except KeyError as e:
        print(e)
        print("No key:", key)
# ------------------------------------------

# Initial DF operations
df['Country_Population'] = df.Country_Region.map(df_population.Population)
df['Country_Confirmed'] = df.Country_Region.map(lambda x: df[df['Country_Region'] == x]['Confirmed'].sum())
df['Country_Active'] = df.Country_Region.map(lambda x: df[df['Country_Region'] == x]['Active'].sum())
df['Country_Confirmed_Percentage'] = df['Country_Confirmed'] / df['Country_Population']
df['Country_Active_Percentage'] = df['Country_Active'] / df['Country_Population']
df['Confirmed_New_Cases'] = df['Confirmed'] - df_week['Confirmed']
df['New_Cases_Percentage'] = df['Confirmed_New_Cases'] / df['Confirmed']
df['New_Cases_Active_Percentage'] = df['Confirmed_New_Cases'] / df['Active']
df['Death_Percentage'] = df['Deaths'] / df['Confirmed']

# Revisar los maximos porque divisiones / 0 da infinito
df = df.replace([np.inf, -np.inf], np.nan)

max_poblacion_casos = df['Country_Confirmed_Percentage'].quantile(QUANTILE)
max_country_active = df['Country_Active_Percentage'].quantile(QUANTILE)
max_new_cases = df['New_Cases_Percentage'].quantile(QUANTILE)
max_new_cases_active = df['New_Cases_Active_Percentage'].quantile(QUANTILE)
max_deaths = df['Death_Percentage'].quantile(QUANTILE)

df['Country_Confirmed_Ratio'] = df['Country_Confirmed_Percentage'] / max_poblacion_casos * 100
df['Country_Active_Ratio'] = df['Country_Active_Percentage'] / max_country_active * 100
df['New_Cases_Ratio'] = df['New_Cases_Percentage'] / max_new_cases * 100
df['New_Cases_Ratio'] = df['New_Cases_Ratio'].clip(upper=100)
df['New_Cases_Active_Ratio'] = df['New_Cases_Active_Percentage'] / max_new_cases_active * 100
df['New_Cases_Active_Ratio'] = df['New_Cases_Active_Ratio'].clip(upper=100)
df['Death_Ratio'] = df['Death_Percentage'] / max_deaths * 100
df['Death_Ratio'] = df['Death_Ratio'].clip(upper=100)

df['Indice'] = df['Death_Ratio'] * 0.2 + df['New_Cases_Ratio'] * 0.6 + df['Country_Confirmed_Ratio'] * 0.2
df['Indice_2'] = df['Death_Ratio'] * 0.4 + df['New_Cases_Ratio'] * 0.6
df['Indice_Active'] = df['Death_Ratio'] * 0.2 + df['New_Cases_Active_Ratio'] * 0.6 + df['Country_Active_Ratio'] * 0.2
df['Indice_Active_2'] = df['Death_Ratio'] * 0.4 + df['New_Cases_Active_Ratio'] * 0.6
max_indice = df['Indice'].quantile(QUANTILE)
max_indice_2 = df['Indice_2'].quantile(QUANTILE)
max_indice_active = df['Indice_Active'].quantile(QUANTILE)
max_indice_active_2 = df['Indice_Active_2'].quantile(QUANTILE)

df['Confirmed_Index'] = 10 - df['Indice'] / max_indice * 10
df['Confirmed_Index'] = df['Confirmed_Index'].clip(lower=0)
df['Confirmed_Index_2'] = 10 - df['Indice_2'] / max_indice_2 * 10
df['Confirmed_Index_2'] = df['Confirmed_Index_2'].clip(lower=0)

df['Active_Index'] = 10 - df['Indice_Active'] / max_indice_active * 10
df['Active_Index'] = df['Active_Index'].clip(lower=0)
df['Active_Index_2'] = 10 - df['Indice_Active_2'] / max_indice_active_2 * 10
df['Active_Index_2'] = df['Active_Index_2'].clip(lower=0)

df['Safety_Index'] = df['Confirmed_Index'] * 0.4 + df['Active_Index'] * 0.6
df['Safety_Index_2'] = df['Confirmed_Index_2'] * 0.4 + df['Active_Index_2'] * 0.6

df.to_csv('static/csv_data.csv')

# DB Init
session = db.session

#TODO: threading y guardar geo data en db
@app.route('/api/v1/riesgo')
def index():
    lugar = strip_accents(request.args.get('lugar'))
    test_query = 'true' == request.args.get('test')
    lang = request.args.get('lang', 'en')
    
    lugar_query = session.query(Place).filter(Place.query == lugar)
    
    if lugar_query.count() == 0:
        raw_data = lookup_data(lugar)
        if raw_data['success']:
            country = raw_data['country']
            province = raw_data['province']
            population = raw_data['population']
        else:
            print(raw_data['message'])
            return render_template('error.html')
    else:
        place = lugar_query.first()
        country = place.country
        province = place.province
        population = place.population
        
        place.hits += 1
        session.add(place)
        session.commit()
        
        print("Found in DB!", place, country, province, population)

    has_province_data = True
    province_df = df[df['Province_State'] == province][df['Country_Region'] == country]
    country_df = df[df['Country_Region'] == country]
    
    if len(province_df.index) == 0 or country == 'United Kingdom':
        print("Not found checking provinces: " + province)
        if province in df_provinces.index.values:
            province = df_provinces['Github'][province]
            province_df = df[df['Province_State'] == province][df['Country_Region'] == country]
        else:
            print("Using country data instead of province")
            province_df = country_df
            has_province_data = False
    
    max_incidence_rate = df['Incident_Rate'].max()
    
    total_active = province_df['Active'].sum()
    total_confirmed = province_df['Confirmed'].sum()
    total_deaths = province_df['Deaths'].sum()
    total_recovered = province_df['Recovered'].sum()
    incidence_rate = province_df['Incident_Rate'].mean()/max_incidence_rate*100
    new_cases = province_df['Confirmed_New_Cases'].sum()
    # per_capita_active = total_active / population
    # per_capita_confirmed = total_confirmed / population
    # per_capita_deaths = total_deaths / population
    # per_capita_recovered = total_recovered / population
    
    if True: #total_recovered > 0:
        safety_index = province_df['Safety_Index'].mean()
    else:
        safety_index = province_df['Safety_Index_2'].mean()

    if safety_index >= 7.5:
        warning_color = 'green'
        risk = RISK[lang]['low']
    elif safety_index < 7.5 and safety_index >= 6:
        warning_color = 'yellow'
        risk = RISK[lang]['med']
    else:
        warning_color = 'red'
        risk = RISK[lang]['high']
        
    data = {
        'place': lugar,
        'country': country,
        'province': province,
        # 'population': population,
        'total_active': int(total_active),
        'total_confirmed': int(total_confirmed),
        'total_deaths': int(total_deaths),
        'total_recovered': int(total_recovered),
        'incidence_rate': float(incidence_rate),
        'weekly_new_cases' : int(new_cases),
        # 'per_capita_active': float(per_capita_active*100),
        # 'per_capita_confirmed': float(per_capita_confirmed*100),
        # 'per_capita_deaths': float(per_capita_deaths*100),
        # 'per_capita_recovered': float(per_capita_recovered*100),
        'safety_index': min(10, max(0, safety_index)),
        'warning_color': warning_color,
        'risk': risk,
        'has_province_data': has_province_data
    }
    
    if np.isnan(safety_index):
        print(f"NAN ERROR: Place: {lugar}, Country: {country}")
        return render_template('error.html')

    if test_query:
        return render_template('safety_test.html', **data)
    else:
        template_name = f'safety_{lang}.html'
        return render_template(template_name, **data)


def lookup_data(lugar):
    
    res = requests.get(WOLFRAM_BASEURL, params={'appid': WOLFRAM_APPID, 'i': f"{QUERY_PROVINCE}{lugar}"})

    if (res.status_code == 200):
        places_array = res.text.split(",")
        country = places_array[-1].lstrip(' ')
        province = places_array[-2].lstrip(' ')
            
        res = requests.get(WOLFRAM_BASEURL, params={'appid': WOLFRAM_APPID, 'i': f"{QUERY_POPULATION}{province},{country}"})
        if (res.status_code == 200):
            try:
                population = extract_number(res.text)
            except Exception as e:
                print(e)
                return {'success': False, 'message': f"Error2: LUGAR={lugar} | QUERY = {QUERY_POPULATION}{province},{country}"}
        else:
            return {'success': False, 'message': f"Error3: LUGAR={lugar} | QUERY = {QUERY_POPULATION}{province},{country}"}
            
        if country == 'United States':
            country = 'US'
        
        # Insert results to db
        new_place = Place(query=lugar, country=country, province=province, hits='1', population=population)  # Agregar population si se descomenta codigo
        session.add(new_place)
        session.commit()
            
        return {'success': True, 'country': country, 'province': province, 'population': population} # Agregar population si se descomenta codigo
        #return f"{lugar} está en la provincia de {province} en el país {country} con población de provincia de {population}"
        # else:
        #     return {'success': False, 'message': f"Error: LUGAR={lugar} | QUERY = {QUERY_POPULATION}{province},{country}"}
            
    else:
        return {'success': False, 'message': f"Error: LUGAR={lugar} | QUERY = {QUERY_PROVINCE}{lugar}"}

# HELPER FUNCTIONS


def extract_number(string):
    regex_number = re.compile(r'[\d\.]+')
    has_million = string.find("million") != -1
    number = float(regex_number.search(string).group())
    if has_million:
        number *= 1000000
    return number

def strip_accents(s):
    return ''.join((c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn'))

if __name__ == '__main__':
    app.run(debug=True)
    