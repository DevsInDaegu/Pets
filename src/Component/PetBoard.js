import React from 'react'
import {ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'

import PetCard from '../Component/PetCard'
import stringToHashColor from '../Helper/stringToColor'

export default function PetBoard({isMobileSize, sheltersNear, findPetsInShelter, petsNear, FETCHING_STATE, shelterNamesShowingPets, setShelterNamesShowingPets}) {
    
    function drawPetFilterByShelter() {
        if (sheltersNear === null ||
            sheltersNear === FETCHING_STATE ||
            sheltersNear.length === 0) {
            return null
        }
        return <div style={{
            width: "100%",
            marginBottom: "1rem"
        }}>

            <ToggleButtonGroup
                value={shelterNamesShowingPets}
                onChange={(event, newShelters) => {
                    setShelterNamesShowingPets(newShelters)
                }}
                aria-label="text formatting"
                style={{
                    overflowX: "scroll",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                {
                    sheltersNear.filter((shelter) => findPetsInShelter(shelter).length > 0).map(shelter => {

                        return <ToggleButton
                            key={shelter.registeredNumber}
                            value={shelter.name}
                            style={{
                                color: stringToHashColor(shelter.name),
                                flexShrink: 0,
                                borderRadius: "1rem",
                                marginRight: "0.5rem"
                            }}
                        >
                            {shelter.name}({`${findPetsInShelter(shelter).length}마리`})

                        </ToggleButton>
                    })
                }
            </ToggleButtonGroup>
        </div>
    }

    return <div style={{
        height: "70vh",
        display: "flex",
        width: "100%",
        flexDirection: "column"
    }}>
        <Typography variant="h4"
            sx={{
                borderBottom: 2,
                borderColor: "primary.main",
                marginBottom: "1rem",
                marginTop: "1rem"
            }}
        >유기동물</Typography>
        {drawPetFilterByShelter()}
        <div style={{
            height: "60vh",
            width: "100%",
            overflowY: "scroll",
            display: "grid",
            gap: "1rem",
            alignSelf: "center",
            paddingBottom: "5rem",
            position: "relative",
            gridTemplateColumns: "1fr",
            justifyContent: "center"
        }}>
            {
                petsNear.map(pet =>
                    <PetCard key={pet.registeredNumber}
                        pet={pet}
                        isMobileSize={isMobileSize}
                        isPresenting={shelterNamesShowingPets.includes(pet.shelter.name)}
                    >
                    </PetCard>
                )
            }
        </div>
    </div>
}