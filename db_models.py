from sqlalchemy import create_engine, Column, Integer, Table, String
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine('sqlite:///wolfram_queries.db')
Base = declarative_base()

class Place(Base):
    __tablename__ = 'places'
    
    id = Column(Integer, primary_key=True)
    query = Column(String)
    country = Column(String)
    province = Column(String)
    population = Column(Integer)
    hits = Column(Integer)

Base.metadata.create_all(engine)

if __name__ == "__main__":
    pass