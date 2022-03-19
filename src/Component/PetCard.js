import React from 'react';
import { Button, Card, CardActions, CardContent, CardMedia, Collapse, Container,  IconButton, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { ExpandMore,  NoteAlt, Person, Phone } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import DateParser from '../Helper/DateParser';
import stringToHashColor from '../Helper/stringToColor';

const ExpandContent = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));


export default function PetCard({ pet, isPresenting, isMobileSize }) {
    const [expanded, setExpanded] = React.useState(false)
    const [showingAbandonedInfo, setShowingAbandonedInfo] = React.useState(false)
    const [showingPhysicalInfo, setShowingPhysicalInfo] = React.useState(false)

    function drawAbandonedInfoSection() {
        if (isMobileSize) {
            return <Container maxWidth="100%">
                <div>
                    {drawAbandonedInfoLabel()}
                    {drawExpandControl({
                        isExpanded: showingAbandonedInfo,
                        onClick: () => {
                            setShowingAbandonedInfo(!showingAbandonedInfo)
                        }
                    })}
                </div>
                <Collapse in={showingAbandonedInfo} timeout="auto" unmountOnExit>
                    {drawAbandonedInfoContent()}
                </Collapse>
            </Container>
        } else {
            return <Container>
                {drawAbandonedInfoLabel()}
                {drawAbandonedInfoContent()}
            </Container>
        }
    }

    function drawExpandControl({ isExpanded, onClick }) {
        return <ExpandContent
            expand={isExpanded}
            onClick={onClick}
            aria-expanded={isExpanded}
        >
            <ExpandMore />
        </ExpandContent>
    }

    function drawAbandonedInfoLabel() {
        return <Typography onClick={() => {
            if (isMobileSize) {
                setShowingAbandonedInfo(!showingAbandonedInfo)
            }
        }} textAlign="center" fontWeight="bold" display="inline">
            유기정보
        </Typography>
    }

    function drawAbandonedInfoContent() {
        const info = pet.abandonedInfo
        const date = new DateParser(info.date).date

        return <Table>
            <TableBody>
                {drawTwoItemsAdjustForSize([
                    {
                        label: "일시",
                        value: `${date.getFullYear()}년 ${date.getMonth()}월 ${date.getDate()}일`
                    },
                    {
                        label: "장소",
                        value: info.place
                    }
                ])}
            </TableBody>
        </Table>
    }

    function drawPhysicalInfoSection() {
        if (isMobileSize) {
            return <Container>
                <div>
                    {drawPhysicalInfoLabel()}
                    {drawExpandControl({
                        isExpanded: showingPhysicalInfo,
                        onClick: () => setShowingPhysicalInfo(!showingPhysicalInfo)
                    })}
                </div>
                <Collapse in={showingPhysicalInfo} timeout="auto" unmountOnExit>
                    {drawPhysicalInfoContent()}
                </Collapse>
            </Container>
        } else {
            return <Container>
                {drawPhysicalInfoLabel()}
                {drawPhysicalInfoContent()}
            </Container>
        }
    }

    function drawPhysicalInfoLabel() {
        return <Typography
            onClick={() => {
                if (isMobileSize) {
                    setShowingPhysicalInfo(!showingPhysicalInfo)
                }
            }}
            textAlign="center" fontWeight="bold" display="inline">동물 정보</Typography>
    }

    function drawPhysicalInfoContent() {
        const info = pet.physicalInfo
        return <Table>
            <TableBody>
                {drawTwoItemsAdjustForSize([
                    {
                        label: "종",
                        value: info.species
                    },
                    {
                        label: "나이",
                        value: info.age
                    }
                ])}
                {drawTwoItemsAdjustForSize([
                    {
                        label: "무게",
                        value: info.weight
                    },
                    {
                        label: "성별",
                        value: info.sex === "M" ? "수컷" : (info.sex === "F" ? "암컷" : "확인안됨")
                    }
                ])}
            </TableBody>
        </Table>
    }

    function drawTwoItemsAdjustForSize(items) {
        if (isMobileSize) {
            return <>
                <TableRow>
                    <TableCell width="30%">
                        {items[0].label}
                    </TableCell>
                    <TableCell>
                        {items[0].value}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>
                        {items[1].label}
                    </TableCell>
                    <TableCell>
                        {items[1].value}
                    </TableCell>
                </TableRow>
            </>
        }
        else {
            return <>
                <TableRow>
                    <TableCell>
                        {items[0].label}
                    </TableCell>
                    <TableCell>
                        {items[1].value}
                    </TableCell>
                    <TableCell>
                        {items[1].label}
                    </TableCell>
                    <TableCell>
                        {items[1].value}
                    </TableCell>
                </TableRow>
            </>
        }
    }

    function drawShelterButton() {

        return <Button
            onClick={() => {
                setExpanded(!expanded)
            }}
            style={{
                color: stringToHashColor(pet.shelter.name),
                border: "1px solid",
                width: "fit-content",
                borderRadius: "0.3rem",
                padding: "0.3rem",
                marginLeft: isMobileSize ? "0": "2rem",  
                marginTop: "0.5rem"
            }}
        >{pet.shelter.name}
            {drawExpandControl({
                isExpanded: expanded,
                onClick: () => { }
            })}
        </Button>

    }

    function drawShelterContent() {
        return <>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Phone/>
                        </TableCell>
                        <TableCell>
                            <a 
                                href={`tel:${pet.shelter.phoneNumber}`}
                                style={{
                                    textDecoration: "none"
                                    }} >
                                {pet.shelter.phoneNumber}</a> 
                                <a
                                href={`tel:${pet.shelter.officePhoneNumber}`}
                                style={{
                                    textDecoration: "none",
                                    marginLeft: "1rem"
                                }} >
                                {pet.shelter.officePhoneNumber}</a> 
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <Person/>
                        </TableCell>
                        <TableCell>
                            {pet.shelter.nameOfInCharge}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <NoteAlt />
                        </TableCell>
                        <TableCell>
                            {pet.note}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </>
    }

    return <>
        <Card className="petCard"
            style={{
                display: isPresenting ? "flex" : "none",
                height: "fit-content",
                overflow: "visible",
                flexDirection: isMobileSize ? "column" : "row"
            }}>
            <CardMedia
                component="img"
                image={pet.imageURL}
                alt={pet.registeredNumber}
                style={{
                    width: isMobileSize ? "60%" : "30%",
                    height: "100%",
                    alignSelf: "center",
                    objectFit: expanded ? "contain" : "fill"
                }}
            />
            <CardContent
                sx={{
                    display: "flex",
                    width: isMobileSize ? "100%" : "70%",
                    flexDirection: "column"
                }}
            >
                {drawAbandonedInfoSection()}
                {drawPhysicalInfoSection()}
                <CardActions disableSpacing>
                    {drawShelterButton()}
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    {/* <CardContent
                        sx={{
                            display: expanded ? "flex" : "none",
                            height: expanded ? "fit-content" : 0
                        }}>
                    </CardContent> */}
                    {drawShelterContent()}
                </Collapse>
            </CardContent>

        </Card>
    </>
}

