import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DogScene from '../Helper/dogScene'

function Intro() {
    const [movingNextPage, setMoving] = useState(false)
    const [highlightedQuote, highlightQuote] = useState("")
    const navigation = useNavigate()
    const canvas = useRef(null)
    const dogScene = useRef(null)
    const BACKGROUND_HEIGHT = 4000
    const MESSAGES_HEIGHT = 3000
    const TRIGGER_NEXT_HEIGHT = 2500

    useEffect(() => {
        dogScene.current = new DogScene(canvas.current)
        dogScene.current.loadModel(dogScene.current.dogModel)
        dogScene.current.loadModel(dogScene.current.houseModel)
        window.scrollTo(0, 0)
        setEventListenerToWindow()
        return removeEventListenerFromWindow
    }, [])

    function setEventListenerToWindow() {
        window.addEventListener('resize', dogScene.current.resize.bind(dogScene.current))
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('keypress', preventSpaceScroll)
    }

    function removeEventListenerFromWindow() {
        window.removeEventListener('resize', dogScene.current.resize.bind(dogScene.current))
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('keypress', preventSpaceScroll)
    }

    function preventSpaceScroll(event) {
        if (event.key === " ") {
            event.preventDefault()
        }
    }

    function handleScroll() {
        dogScene.current.updatePlaytime(window.scrollY * 0.01)

        if (!movingNextPage, window.scrollY > TRIGGER_NEXT_HEIGHT) {
            navigation('./home')
            setMoving(true)
        }
    }

    const quotes = [
        "만일 10일 뒤에 죽는다면 지금 뭐하고 싶으세요?",
        // "우리 가족하고 여행가지 않을까요?",
        // "생각해 본 적이 없는데... 그냥 안 죽으면 안돼요?",
        // "같은 질문을 이들에게 다시 해봤습니다",
        // "10일 뒤 죽는다면 지금 뭐하고 싶으세요?",
        "구조된 뒤 가족을 찾기 못하면 10일뒤 ...",
        "안락사나 자연사로 죽음을 맞는 경우 49.8%",
        "만약 말을 할 수 있다면 이들의 마지막 희망은",
        "아마 이것 아닐까요? ",
        "\"가족을 다시 만나고 싶어요\""
    ]

    const quotesOffsetMap = useRef(new Map())

    function drawIntroMessages() {
        return <>
            <h5 style={{
                textAlign: 'start',
                fontSize: '2rem',
                marginBottom: "10em"
            }}>스크롤을 아래로 내리세요</h5>
            {quotes.map((quote) => {
                return <motion.p 
                    key={quote} 
                    onViewportEnter={(event) => {
                        quotesOffsetMap.current.set(event.target.offsetTop, quote)
                        setQuoteToHighlight()
                    }}
                    onViewportLeave={setQuoteToHighlight}
                    animate={{
                        opacity: quote === highlightedQuote ? 1: 0.2,
                        scale: quote === highlightedQuote ? 1.2: 1,
                        x: quote === highlightedQuote ? "0%": "15%",
                    }}
                    transition={{
                        duration: 0.5,
                        type: "tween",
                        ease: "easeIn"
                    }}
                    style={{
                        textAlign: 'end',
                        color: "white",
                    }}>{quote}</motion.p>
            })}
            <h1
                style={{
                    paddingLeft: "10vw",
                    fontFamily: 'Courier New',
                    fontWeight: 'bolder',
                    fontSize: '5em'
                }}
            >Pets</h1></>
    }

    function setQuoteToHighlight() {

        const midY = window.scrollY + parseInt(window.screen.height)/2
        const offsets = Array.from(quotesOffsetMap.current.keys())
        let minDistance = window.screen.height
        let minOffset = null
        offsets.forEach((offset) => {
            let distance = Math.abs(midY - offset)
            if(distance < minDistance) {
                minDistance = distance
                minOffset = offset
            }
        })
        console.assert(minOffset != null, "Unable to find key offset for qoute")
        const qouteToHighlight = quotesOffsetMap.current.get(minOffset)
        highlightQuote(qouteToHighlight)
    }

    function playYoutubeBGM() {
        const id = "pNKN_9DW-lM"
        return <iframe
            width="300"
            height="170"
            src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&start=30`}
            style={{
                position: 'sticky',
                top: '0',
                left: '0',
                borderRadius: 10,
                zIndex: 2
            }}
            frameBorder="0"
            autohide="1"
            allow="autoplay; fullscreen"
            title="Youtube BGM"
        />
    }

    return <motion.div
        className="Intro"
        exit={{ 
            opacity: 0,
            y: "-50%"
         }}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{
            duration: 0.5,
            ease: "easeIn"
        }}>
        <div style={{
            position: "absolute",
            top: "10vh",
            width: "80vw",
            marginLeft: '5vw',
            height: MESSAGES_HEIGHT,
            color: 'white',
            fontSize: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'Noto Sans KR, sans-serif',
            textAlign: 'end',
            zIndex: 1
        }}>
            { playYoutubeBGM() }
            { drawIntroMessages() }
        </div>
        <div ref={canvas} style={{
            position: 'sticky',
            top: 0,
            height: "100vh",
            width: "100vw",
        }} />
        <div style={{
            overflow: "hidden",
            height: BACKGROUND_HEIGHT,
            display: 'hidden',
        }}
        >
            {/* { playYoutubeBGM() } */}
        </div>
    </motion.div>
}

export default Intro