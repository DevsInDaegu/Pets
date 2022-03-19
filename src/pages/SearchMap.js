import React, { useState, useEffect, useRef } from 'react'
import { Button, LinearProgress, Container, Alert, AlertTitle, Typography } from '@mui/material'
import { Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion'

import Navbar from '../Component/Navbar'
import PetMap from '../Component/PetMap';
import ShelterBoard from '../Component/ShelterBoard';
import PetBoard from '../Component/PetBoard';

export default function SearchMap({ petFetcher, dataStorage }) {
    const NOT_NEEDED_ERROR = "NOT_NEEDED"
    const MATCHING_DATA_NOT_FOUND_ERROR = "MATCHING_DATA_NOT_FOUND_ERROR"
    const FETCHING_STATE = "FETCHING"

    const googleMapHandler = useRef(null)
    const [sheltersNear, setShelters] = useState(null)
    const [petsNear, setPetsNear] = useState(null)
    const isPageMounted = useRef(true)
    const addressFetching = useRef(null)
    const lastFetchedLocation = useRef(null)
    const [userErrorMessage, setUserErrorMessage] = useState(null)
    const [isMobileSize, setIsMobileSize] = useState(true)
    const [shelterNamesShowingPets, setShelterNamesShowingPets] = useState(new Set())

    useEffect(() => {
        resize()
        window.addEventListener("resize", resize)
        return () => {
            isPageMounted.current = false
            window.removeEventListener("resize", resize)
        }
    }, [])

    function resize() {
        setIsMobileSize(window.innerWidth < 1000)
    }

    async function requestDataForNewCoodinates({ lat, lng }) {
        lastFetchedLocation.current = {
            lat,
            lng
        }
        let location
        setUserErrorMessage(null)
        try {
            location = await fetchLocationFrom({ lat, lng })
        } catch (error) {
            console.error("Fail to request location ", error)
            if (error !== NOT_NEEDED_ERROR) {
                setUserErrorMessage("위치 정보를 읽는데 실패하였습니다")
            }
            return
        }
        const newAddress = `${location.area.name} ${location.city.name}`
        if (addressFetching === newAddress) {
            return
        }
        googleMapHandler.current.showAddress(newAddress)
        setPageAsFetching()
        fetchAbandonedPetsNear(location, { lat, lng })
        findSheltersNear(location.city, { lat, lng })
        addressFetching.current = newAddress
    }

    function setPageAsFetching() {
        setPetsNear(FETCHING_STATE)
        setShelters(FETCHING_STATE)
        setShelterNamesShowingPets([])
    }

    async function fetchLocationFrom(coordinates) {

        if (coordinates.lat !== lastFetchedLocation.current.lat ||
            coordinates.lng !== lastFetchedLocation.current.lng) {
            throw NOT_NEEDED_ERROR
        }

        return await getAreaAndCityFrom(coordinates)
    }

    async function getAreaAndCityFrom(location) {

        const address = await googleMapHandler.current.requestUserAddress(location)
        const foundArea = petFetcher.areas.find((area) => area.name === address.areaName)
        if (foundArea === undefined) {
            throw MATCHING_DATA_NOT_FOUND_ERROR
        }
        const cities = petFetcher.getCitiesIn(foundArea)
        const foundCity = cities.find((city) => city.name === address.cityName)
        if (foundCity === undefined) {
            throw MATCHING_DATA_NOT_FOUND_ERROR
        }

        return {
            area: foundArea,
            city: foundCity
        }

    }

    async function findSheltersNear(city, coordinates) {
        if (!isPageMounted.current ||
            coordinates.lat !== lastFetchedLocation.current.lat ||
            coordinates.lng !== lastFetchedLocation.current.lng) {
            return
        }
        try {
            const shelters = (await petFetcher.getSheltersIn(city)).shelters
            setShelters(shelters)
            setShelterNamesShowingPets(shelters.map((shelter) => shelter.name))
            shelters.forEach(petFetcher.fetchShelterDetailOf)
        } catch (error) {
            const isTimeOut = error.name === "AbortError"
            if (petFetcher.manuallyAbortedRequestIDs.has(city.name)) {
                return
            }
            console.error("Fail to fetch shelter data", error)
            setShelters(null)
            setUserErrorMessage(isTimeOut ? "서버가 응답하지 않습니다" : "동물 보호소 정보를 가져오지 못했습니다")
        }
    }

    async function fetchAbandonedPetsNear(location, coordinates) {
        if (!isPageMounted.current ||
            coordinates.lat !== lastFetchedLocation.current.lat ||
            coordinates.lng !== lastFetchedLocation.current.lng) {
            return
        }

        const period = createPeriodDuringDays(10)
        try {
            const pets = await petFetcher.fetchAbandonedPets({
                area: location.area,
                city: location.city,
                period
            })

            setPetsNear(pets)
        } catch (error) {
            const isTimeOut = error.name === "AbortError"
            if (petFetcher.manuallyAbortedRequestIDs.has(location.city.name)) {
                return
            }
            console.error("Fail to fetch pets", error)
            setPetsNear(null)
            setUserErrorMessage(isTimeOut ? "서버가 응답하지 않습니다" : "유기 동물 정보를 가져오지 못했습니다")
        }
    }

    function createPeriodDuringDays(days) {
        const now = new Date()
        const start = new Date(now)
        start.setDate(now.getDate() - days)
        return {
            start: start,
            end: now
        }
    }

    function drawShelterBoard() {
        if (sheltersNear === null) {
            return null
        }
        else if (sheltersNear === FETCHING_STATE) {
            return showUserNotice.fetchingShelter()
        }
        else if (sheltersNear.length === 0) {
            return showUserNotice.shelterNotFound()
        }
        else {
            return <ShelterBoard
                sheltersNear={sheltersNear}
                googleMapHandler={googleMapHandler}
                petFetcher={petFetcher}
            />
        }
    }

    const showUserNotice = {
        fetchingShelter: (() => <Typography variant="h4" style={{
            marginTop: "2rem"
        }}>
            보호소 찾는중
            <LinearProgress style={{
                width: "80%"
            }} /></Typography>),
        shelterNotFound: (() => <Typography variant="h4" style={{
            marginTop: "2rem"
        }} >보호소를 찾지 못했습니다</Typography>),
        fetchingAbandonedPets: (() => <Typography
            variant="h4"
            style={{
                marginTop: "5rem"
            }}>
            유기동물 찾는중
            <LinearProgress style={{
                width: "80%"
            }} /></Typography>),
        abandonedPetsNotFound: (() => <Typography variant="h4">유기동물을 찾지 못했습니다</Typography>)
    }

    function findPetsInShelter(shelter) {
        if (petsNear === null || petsNear === FETCHING_STATE) {
            return []
        } else {
            return petsNear.filter((pet) => pet.shelter.name === shelter.name)
        }
    }

    function drawAbandonedPetsBoard() {
        if (petsNear === null) {
            return null
        }
        else if (petsNear === FETCHING_STATE) {
            return showUserNotice.fetchingAbandonedPets()
        }
        else if (petsNear.length === 0) {
            return showUserNotice.abandonedPetsNotFound()
        }

        return <PetBoard
            petsNear={petsNear}
            sheltersNear={sheltersNear}
            findPetsInShelter={findPetsInShelter}
            isMobileSize={isMobileSize}
            FETCHING_STATE={FETCHING_STATE}
            shelterNamesShowingPets={shelterNamesShowingPets}
            setShelterNamesShowingPets={setShelterNamesShowingPets}
        />
    }

    function showUserErrorMessageIfExist() {
        if (userErrorMessage !== null) {
            return <motion.div
                initial={{
                    opacity: 0,
                    y: "-1rem"
                }}
                animate={{
                    opacity: 1,
                    y: 0
                }}
                style={{
                    marginBottom: "-2.5rem",
                    zIndex: 4,
                    position: "sticky"
                }}
            >
                <Alert severity='warning' style={{
                    marginTop: "1rem"
                }}>
                    <AlertTitle>{userErrorMessage}
                        <Cancel style={{
                            marginLeft: "1rem"
                        }}
                            onClick={() => setUserErrorMessage(null)}
                        /></AlertTitle>
                    다른 지역을 시도하거나 또는
                    <Button color="primary" size="small"
                        style={{
                            marginLeft: "1rem",
                        }}
                        onClick={() => {
                            addressFetching.current = null
                            requestDataForNewCoodinates(lastFetchedLocation.current)
                        }}>현위치 재시도</Button>

                </Alert>
            </motion.div>
        } else {
            return null
        }
    }

    return <>
        <Navbar />
        <Container maxWidth="xl">
            {showUserErrorMessageIfExist()}
            <div style={{
                display: "flex",
                flexDirection: isMobileSize ? "column" : "row",
                justifyContent: "space-evenly",
                overflowY: isMobileSize ? "scroll" : "hidden",
                overflowX: isMobileSize ? "hidden" : "auto"
            }}>

                <PetMap
                    googleMapHandler={googleMapHandler}
                    dataStorage={dataStorage}
                    lastFetchedLocation={lastFetchedLocation}
                    requestDataForNewCoodinates={requestDataForNewCoodinates}
                    isMobileSize={isMobileSize}
                />
                <div style={{
                    display: "flex",
                    width: isMobileSize ? "90vw" : "50vw",
                    height: "90vh",
                    justifyContent: "flex-start",
                    flexDirection: "column",
                    marginLeft: "1rem",
                    alignItems: isMobileSize ? "start" : "center",
                    overflowY: "scroll"
                }}>
                    {drawShelterBoard()}
                    {drawAbandonedPetsBoard()}
                </div>
            </div>
        </Container>
    </>
}