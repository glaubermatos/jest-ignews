import { useState, useEffect } from 'react'

export function Async() {
    const [isButtonVisible, setIsButtonVisible] = useState(false)
    const [isButtonInvisible, setIsButtonInvisible] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setIsButtonVisible(true)
            setIsButtonInvisible(true)
        }, 1000)
    }, [])

    return (
        <div>
            <div>Hello world</div>
            { isButtonVisible && <button>Button</button>}
            { !isButtonInvisible && <button>Button 2</button>}
        </div>
    )
}