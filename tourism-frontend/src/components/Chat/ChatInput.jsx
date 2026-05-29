import { useState, useRef, useEffect } from 'react'
import Spinner from '../UI/Spinner'

const SUGGESTIONS = [
  {
    icon: '🏨',
    text: 'Hôtels'
  },

  {
    icon: '🍽️',
    text: 'Restaurants'
  },

  {
    icon: '🎭',
    text: 'Événements'
  },

  {
    icon: '🏛️',
    text: 'Sites archéologiques'
  }
]

export default function ChatInput({
  onSend,
  loading
}) {

  const [value,setValue]=useState('')

  const textareaRef=useRef(null)

  useEffect(()=>{

    const ta=textareaRef.current

    if(!ta) return

    ta.style.height='auto'

    ta.style.height=
    Math.min(
      ta.scrollHeight,
      130
    )+'px'

  },[value])


  const submit=()=>{

    if(
      !value.trim()
      ||
      loading
    ) return

    onSend(
      value.trim()
    )

    setValue('')

    if(textareaRef.current){

      textareaRef.current.style.height='auto'

    }

  }


  const onKey=(e)=>{

    if(
      e.key==='Enter'
      &&
      !e.shiftKey
    ){

      e.preventDefault()

      submit()

    }

  }


  return (

<div className="input-zone">

<div className="suggestions-row">

{SUGGESTIONS.map((item)=>(

<button
key={item.text}
className="suggestion-card"
onClick={()=>onSend(item.text)}
disabled={loading}
>

<span className="suggestion-icon">

{item.icon}

</span>

<span>

{item.text}

</span>

</button>

))}

</div>


<div className="input-row">

<textarea
ref={textareaRef}
className="chat-textarea"
placeholder="Posez votre question sur la Tunisie..."
value={value}
onChange={(e)=>setValue(e.target.value)}
onKeyDown={onKey}
rows={1}
disabled={loading}
/>

<button
className="send-btn"
onClick={submit}
disabled={
loading
||
!value.trim()
}
>

{loading

?

<Spinner size={18}/>

:

<svg
viewBox="0 0 24 24"
fill="none"
width="18"
height="18"
>

<path
d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
/>

</svg>

}

</button>

</div>

</div>

)

}