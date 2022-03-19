import React, { useState } from 'react'
import { Button, MenuItem, Container, Typography, Divider, Card, TableContainer, Paper, TableRow, TableBody, TableCell, Table } from '@mui/material'
import { renderToStaticMarkup } from 'react-dom/server';
import { Info, Phone, LocationSearching, KeyboardArrowDown, Close } from '@mui/icons-material';
import { blue, green } from '@mui/material/colors'
import { AnimatePresence, motion } from 'framer-motion'

import { StyledPopupMenu } from '../Component/styledPopupMenu';

export default function ShelterBoard({ sheltersNear, googleMapHandler, petFetcher }) {

    const [expandedShelterButton, expandShelterButton] = useState(null)
    const [focusedShelter, focusToShelter] = useState(null)
    const [shelterShowingDetail, showShelterDetail] = useState(null)
    const [showingOperation, setShowingOperation] = useState(true)

    function drawShelterButtons() {
        return <div style={{
            display: "flex",
            flexDirection: "row",
            overflowX: "scroll"
        }}>
            {
                sheltersNear.map(shelter => {
                    return <Button
                        id={`shelterButton${shelter.name}`}
                        key={shelter.registeredNumber}
                        aria-controls={Boolean(expandedShelterButton) ? "shelterButtonMenu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={Boolean(expandedShelterButton) ? "true" : undefined}
                        onClick={(event) => clickShelterButton(event.currentTarget, shelter)}
                        variant="outlined"
                        style={{
                            flexShrink: 0,
                            marginLeft: "0.3rem"
                        }}
                        endIcon={<KeyboardArrowDown />}
                    >
                        {shelter.name}
                    </Button>
                })
            }
        </div>
    }

    async function clickShelterButton(button, shelter) {
        const shelterDetail = await petFetcher.getShelterDetailOf(shelter)
        shelter.detail = shelterDetail
        focusToShelter(shelter)
        expandShelterButton(button)
    }

    function drawShelterPopupMenu() {
        if (focusedShelter === null) {
            return null
        }
        return <StyledPopupMenu
            id="shelterButtonMenu"
            anchorEl={expandedShelterButton}
            open={Boolean(expandedShelterButton)}
            onClose={() => expandShelterButton(null)}
            MenuListProps={{
                "area-labelledby": `shetlerButton${clickShelterButton.id}`
            }}
        >
            {drawShelterPopupMenuItems()}
        </StyledPopupMenu>
    }

    function drawShelterPopupMenuItems() {
        if (focusedShelter.detail === undefined || focusedShelter.detail === null) {
            return <Typography style={{
                margin: "0.5rem"
            }}>보호소 정보가 없습니다</Typography>
        } else {
            return [
                <MenuItem key="showShelterOnMapMenu"
                    onClick={() => {
                        expandShelterButton(null)
                        showShelterOnMap(focusedShelter)
                    }}>
                    <LocationSearching style={{
                        color: blue[500]
                    }} />
                    보호소 위치로 이동
                </MenuItem>,
                <MenuItem key="showShelterDetailMenu"
                    onClick={() => {
                        expandShelterButton(null)
                        setShowingOperation(true)
                        showShelterDetail(focusedShelter)
                    }}
                >
                    <Info style={{
                        color: blue[500]
                    }} />
                    자세히 보기
                </MenuItem>
            ]
        }
    }

    function showShelterOnMap(shelter) {
        const labelComponent = <Container>
            <Typography> {shelter.name}</Typography>
            <Divider />
            <Typography>{shelter.detail.address}</Typography>
        </Container>
        googleMapHandler.current.closeAllWindows()
        googleMapHandler.current.openWindow({
            coordinates: shelter.detail.coordinates,
            contentString: renderToStaticMarkup(labelComponent),
            title: shelter.name
        })
    }

    function drawShelterDetail() {
        if (shelterShowingDetail === null) {
            return null
        } else {
            const detail = shelterShowingDetail.detail
            return <motion.div
                initial={{
                    opacity: 0.5,
                    y: "-30%",
                    height: "50%"
                }}
                exit={{
                    opacity: 0,
                    height: "50%"
                }}
                animate={{
                    opacity: 1,
                    height: "100%",
                    y: 0
                }}
                style={{
                    padding: "0.5rem",
                    margin: "0.5rem",
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeIn"
                }}
            >
                <Typography color="textPrimary"
                    variant="h5"
                    style={{
                        marginLeft: "0.5rem"
                    }}
                >{shelterShowingDetail.name}
                    <Button variant="outlined"
                        onClick={() => showShelterDetail(null)}
                        style={{
                            marginLeft: "1.5rem"
                        }}
                    >
                        <Close color="primary" />
                    </Button>
                </Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="spanning table">
                        <TableBody>
                            {drawDefaultSection(detail)}
                            {drawOperationSection(detail)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>
        }
    }

    function drawDefaultSection(detail) {
        return <>
            <TableRow key="address">
                <TableCell width="10%">
                    주소
                </TableCell>
                <TableCell width="50%">
                    {detail.address}
                    {detail.coordinates !== null ?
                        <a href={createNaverMapUrlTo({
                            name: detail.name,
                            lat: detail.coordinates.lat,
                            lng: detail.coordinates.lng
                        })}
                            target='_blank'
                            style={{
                                display: "inline",
                                textDecoration: "none",
                            }}
                        >
                            <Button
                                variant="text"
                                style={{
                                    color: green[500]
                                }}
                            >네이버 길찾기</Button></a>
                        : null}

                </TableCell>
            </TableRow>
            <TableRow key="phoneNumber">
                <TableCell >
                    연락처
                </TableCell>
                <TableCell>
                    {detail.phoneNumber}
                    <a href={`tel:${detail.phoneNumber}`}>
                        <Button>
                            <Phone
                                color="primary"
                                style={{
                                    marginLeft: "0.5rem",
                                    width: "1.5rem",
                                    height: "1.5rem"
                                }} />
                        </Button>
                    </a>
                </TableCell>
            </TableRow>
            <TableRow key="institute">
                <TableCell>
                    기관
                </TableCell>
                <TableCell>
                    <Typography
                        display="inline"
                        style={{
                            border: "2px solid black",
                            backgroundColor: "lightGray",
                            borderRadius: "10px",
                            padding: "2px",
                            marginRight: "0.5rem"
                        }}
                    >{detail.category}</Typography>
                    {detail.affiliatedInstitute}
                </TableCell>
            </TableRow>
        </>
    }

    function createNaverMapUrlTo(destination) {
        const userLocation = googleMapHandler.current.userLocation
        
        let url = `http://map.naver.com/index.nhn`
        url += `?slng=${userLocation.lng}`
        url += `&slat=${userLocation.lat}`
        url += `&stext=현재위치`
        url += `&elng=${destination.lng}`
        url += `&elat=${destination.lat}`
        url += `&etext=${destination.name}`
        url += `&menu=route`
        url += `&pathType=1`
        return url
    }

    function drawOperationSection(detail) {
        const showingDayoff = detail.operation.dayOff !== null 
        const showingWeekday = detail.operation.weekday.open !== null && detail.operation.weekday.close !== null
        const showingWeekend = detail.operation.weekend.open !== null && detail.operation.weekend.close !== null
        if(!showingDayoff && !showingWeekday && !showingWeekend) {
            return null
        }
        return <>
            <TableRow key="operation">
                <TableCell>
                    운영 정보
                </TableCell>
                <TableCell>
                    <Button onClick={() => {
                        setShowingOperation(!showingOperation)
                    }}>
                        {showingOperation ? "숨기기" : "보이기"}
                    </Button>
                </TableCell>
            </TableRow>
            {showingOperation ? drawOperationInfoOf({detail, showingDayoff, showingWeekday, showingWeekend}) : null}
        </>
    }

    function drawOperationInfoOf({detail, showingDayoff, showingWeekday, showingWeekend}) {
      
        return <>
            {showingDayoff ?
                <TableRow key="dayoff">
                    <TableCell />
                    <TableCell align="center">
                        휴일
                    </TableCell>
                    <TableCell align="left">
                        {detail.operation.dayOff.join(", ")}
                    </TableCell>
                </TableRow>
                : null
            }
            {showingWeekday ?
                <TableRow>
                    <TableCell />
                    <TableCell align="center">
                        주중
                    </TableCell>
                    <TableCell align="left" colSpan={2}>
                        {`${detail.operation.weekday.open} ~ ${detail.operation.weekday.close}`}
                    </TableCell>
                </TableRow>
                : null}
            {showingWeekend ?
                <TableRow>
                    <TableCell />
                    <TableCell align="center">
                        주말
                    </TableCell>
                    <TableCell>
                        {`${detail.operation.weekend.open} ~ ${detail.operation.weekend.close}`}
                    </TableCell>
                </TableRow> :
                null
            }
        </>
    }

    return <div style={{
        width: "100%"
    }}>
        <Typography variant="h4"
            sx={{
                borderBottom: 2,
                borderColor: "primary.main"
            }}
            style={{
                marginTop: "2rem",
                marginBottom: "1rem"
            }} >보호소</Typography>
        {drawShelterButtons()}
        {drawShelterPopupMenu()}
        <AnimatePresence exitBeforeEnter>
            {drawShelterDetail()}
        </AnimatePresence>
    </div>
}