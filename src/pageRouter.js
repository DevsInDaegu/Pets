import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home';
import Intro from './pages/Intro'
import SearchMap from './pages/SearchMap'
import PetFetcher from './Model/petFetcher';
import ReduxHandler from './Helper/ReduxHander';

function PageRouter() {

    const location = useLocation()
    const dataStorage = React.useRef(new ReduxHandler())
    const petFetcher = React.useRef(new PetFetcher(dataStorage.current))

    return <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={location.pathname}>
            <Route exact path="/" element={<Intro />} />
            {/* <Route path="/home" element={<Home petFetcher={petFetcher.current} dataStorage={dataStorage.current}/>} /> */}
            <Route path="/searchmap" element={<SearchMap petFetcher={petFetcher.current} dataStorage={dataStorage.current}/>}  />
        </Routes>
    </AnimatePresence>
}

export default PageRouter