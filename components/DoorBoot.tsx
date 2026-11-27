'use client'

import { useEffect } from 'react'
import { openDoor } from '@/lib/door'

export default function DoorBoot() {
    useEffect(() => {
        openDoor()
    }, [])
    return null
}
