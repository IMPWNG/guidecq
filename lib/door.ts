const KEY = 'cq-door'

function reduced() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function shutDoor(accent: string, done: () => void) {
    if (reduced()) {
        done()
        return
    }
    const door = document.querySelector('#door')
    if (!(door instanceof HTMLElement)) {
        done()
        return
    }
    door.style.setProperty('--seam', accent)
    try {
        sessionStorage.setItem(KEY, accent)
    } catch {
        /* private mode still navigates */
    }
    door.classList.add('is-shut')
    let went = false
    const go = () => {
        if (went) return
        went = true
        done()
    }
    door.querySelector('.shutter')?.addEventListener('transitionend', (event) => {
        if (event instanceof TransitionEvent && event.propertyName === 'transform') go()
    })
    setTimeout(go, 420)
}

export function openDoor() {
    let accent = ''
    try {
        accent = sessionStorage.getItem(KEY) || ''
        sessionStorage.removeItem(KEY)
    } catch {
        /* ignore */
    }
    const door = document.querySelector('#door')
    if (!accent || reduced()) {
        door?.classList.remove('is-shut', 'is-instant')
        return
    }
    if (!(door instanceof HTMLElement)) return
    door.style.setProperty('--seam', accent)
    door.classList.add('is-shut')
    door.classList.remove('is-instant')
    requestAnimationFrame(() => {
        requestAnimationFrame(() => door.classList.remove('is-shut'))
    })
}
