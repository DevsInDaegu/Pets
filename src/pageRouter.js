import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home';
import Intro from './pages/Intro'

function PageRouter() {

    const location = useLocation()

    return <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={< Intro />} />
            <Route path="/home" element={<Home />} />
        </Routes>
    </AnimatePresence>
}

export default PageRouter