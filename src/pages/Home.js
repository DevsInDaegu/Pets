import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import PetFetcher from '../Model/petFetcher'
import Navbar from '../Component/Navbar'

function Home({petFetcher}) {
  
  const DEFULT_DAYS_TO_FIND = 10
  const [areas, setAreas] = useState([])
  const [showingArea, showArea] = useState(null)
  const [showingCity, showCity] = useState(null)
  const [showingFamily, showFamily] = useState(null)
  const [selectedShelter, setShelter] = useState(null)
  const [selectedSpecies, selectSpecies] = useState(null)
  const [daysToFind, setDaysToFind] = useState(DEFULT_DAYS_TO_FIND)
  const [petsToShow, showPets] = useState(null)

  function createPeriodDuringDays(days) {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - days)
    return {
      start: start,
      end: now
    }
  }

  function didAppear() {
    setAreas(petFetcher.areas)
  }

  useEffect(() => {
    didAppear()
    return () => {
      petFetcher.onAreasChange = PetFetcher.onAreasChangePlaceHolder
    }
  }, [])

  function createAreaButton(area) {
    return <button key={area.code}
      onClick={() => clickAreaButton(area)}
      style={{
        color: area.code === showingArea?.code ? "blue" : null
      }}>
      {area.name}
    </button>
  }

  async function clickAreaButton(area) {
    if (showingArea !== null && area === showingArea.area) {
      return
    }
    showCity(null)
    setShelter(null)
    const cities = petFetcher.getCitiesIn(area)
    showArea({
      area,
      cities
    })
    cities.cities.forEach(petFetcher.fetchSheltersInIfNeeded.bind(petFetcher))
  }

  function drawCityButtons() {
    if (showingArea === null) {
      return null
    }
    else if (showingArea.cities.length !== 0) {
      return showingArea.cities.map(createCityButton)
    } else {
      return <p>Empty</p>
    }
  }

  function createCityButton(city) {

    return <button key={city.code}
      onClick={() => clickCityButton(city)}
      style={{
        color: city.code === showingCity?.code ? "blue" : null
      }}
    > {city.name} </button>
  }

  async function clickCityButton(city) {
    if (showingCity === city) {
      return
    }
    setShelter(null)
    const fetched = await petFetcher.getSheltersIn(city)
    showCity(fetched)
  }

  function drawShelters() {
    if (showingCity === null) {
      return null
    }
    else if (showingCity.shelters.length === 0) {
      return "Empty"
    }
    return <ul>
      {showingCity.shelters.map(drawShelterLabel)}
    </ul>
  }

  function drawShelterLabel(shelter) {
    return <li key={shelter.registeredNumber}>
      <button
        onClick={() => setShelter(shelter)}
        style={{
          color: shelter.registeredNumber === selectedShelter?.registeredNumber ? "blue" : null
        }}
      > {shelter.name} </button>
    </li>
  }

  function drawSelectFamily() {
    const allFamilyKeys = Object.keys(petFetcher.petFamilies)
    return <select onChange={onSelectFamilyChange}>
      <option value={""}>종류를 선택해주세요</option>
      {allFamilyKeys.map(key =>
        <option key={key} value={key}>
          {petFetcher.petFamilies[key]}
        </option>
      )}
    </select>
  }

  async function onSelectFamilyChange(event) {
    selectSpecies(null)
    const familyName = event.target.value

    if (familyName.length === 0) {
      showFamily(null)
    }
    else {
      const fetched = await petFetcher.getSpeciesFor(familyName)
      showFamily(fetched)
    }
  }

  function drawSelectSpecies() {
    if (showingFamily === null) {
      return null
    }

    return <select onChange={onSelectSpecies}>
      <option value="">모든 품종</option>
      {showingFamily.species.map((species) =>
        <option key={species.code} value={JSON.stringify(species)}>
          {species.name}
        </option>
      )}
    </select>
  }

  function onSelectSpecies(event) {
    const json = event.target.value
    if (json === "") {
      selectSpecies(null)
    }
    selectSpecies(JSON.parse(json))
  }

  function drawPeriodInput() {
    return <div>
      <span>검색 날짜수</span>
      <input type="number"
        value={daysToFind}
        onChange={(event) => {
          if (event.target.value > 0 && event.target.value < 1000) {
            setDaysToFind(event.target.value)
          }
        }}></input>
    </div>
  }

  function drawCallApiButton() {
    return <button onClick={callAPI}>
      Call API
    </button>
  }

  async function callAPI() {
    const periodToFind = createPeriodDuringDays(daysToFind)

    const fetched = await petFetcher.fetchAbandonedPets({
      period: periodToFind,
      shelter: selectedShelter,
      city: showingCity,
      area: showingArea,
      family: showingFamily,
      species: selectedSpecies
    })
    showPets(fetched)
  }

  function showPetsIfneeded() {
    if (petsToShow === null) {
      return null
    }
    return petsToShow.map(pet =>
      <pre key={pet.desertionNo}
        style={{
          overflow: "auto",
          whiteSpace: "pre-wrap"
        }}
      >{JSON.stringify(pet)}</pre>
    )
  }

  return <>
    <Navbar />
    <motion.div className="Home"
      exit={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeIn"
      }}>
      {drawSelectFamily()}
      {drawSelectSpecies()}
      <div>{areas.map(createAreaButton)}</div>
      {drawCityButtons()}
      {drawShelters()}
      {drawPeriodInput()}
      {drawCallApiButton()}
      {showPetsIfneeded()}
    </motion.div>
  </>
}

export default Home;