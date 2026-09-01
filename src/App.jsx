import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MorphSlider from './MorphSlider'
import ChromaGrid from './ChromaGrid'
import Masonry from './Masonry'
import DriftWall from './DriftWall'
gsap.registerPlugin(ScrollTrigger)
// kill refresh jump before React mounts
if(typeof window!=='undefined'){
  if('scrollRestoration' in history) history.scrollRestoration='manual'
  // clear hash that forces jump to #shop on refresh
  if(window.location.hash) history.replaceState(null,'', window.location.pathname)
  window.scrollTo(0,0)
}

const products = [
  { id:1, name:"Eternal Blush", price:"₹ 2,499", img:"https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=700&q=80", tag:"01 — BESTSELLER" },
  { id:2, name:"Midnight Peony", price:"₹ 3,299", img:"https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=700&q=80", tag:"02 — NEW" },
  { id:3, name:"Citrus Garden", price:"₹ 1,899", img:"https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=700&q=80", tag:"03 — LIMITED" },
  { id:4, name:"Wild Meadow", price:"₹ 2,149", img:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=700&q=80", tag:"04 — SEASONAL" },
  { id:5, name:"Velvet Rose Box", price:"₹ 4,500", img:"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=700&q=80", tag:"05 — LUXE" },
  { id:6, name:"Sunlit Tulips", price:"₹ 1,650", img:"https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=700&q=80", tag:"06 — FRESH" },
]

export default function App(){
  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const heroWrapRef = useRef(null)
  const heroTriggerRef = useRef(null)
  const cursorRef = useRef(null)
  const cursorLabelRef = useRef(null)
  const trackRef = useRef(null)
  const videoRef = useRef(null)
  const videoWrapRef = useRef(null)
  const canvasRef = useRef(null)
  const framesRef = useRef([])
  const frameCount = 240
  const { scrollYProgress } = useScroll()
  const [frameMode, setFrameMode] = useState(false)
  const [morphIndex, setMorphIndex] = useState(0)
  const morphItems = useMemo(()=> products.map(p=> ({ image: p.img, caption: `${p.name} • ${p.tag}` })), [])

  useEffect(()=>{
    window.scrollTo(0,0)
    if(window.location.hash) history.replaceState(null,'', window.location.pathname)
    const lenis = new Lenis({ duration:1.35, smoothWheel:true, easing:(t)=>1-Math.pow(1-t,3) })
    lenis.scrollTo(0, { immediate:true })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time)=> lenis.raf(time*1000))
    // don't lagSmooth - was causing 1s freeze
    const raf = (time)=>{ lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    const id=setTimeout(()=>{ ScrollTrigger.refresh(); window.scrollTo(0,0); lenis.scrollTo(0, {immediate:true}) }, 200)
    return ()=>{ clearTimeout(id); lenis.destroy(); gsap.ticker.remove((time)=> lenis.raf(time*1000)) }
  },[])
  useEffect(()=>{ 
    const t=setTimeout(()=>{ setLoading(false); setTimeout(()=>{ ScrollTrigger.refresh(); window.scrollTo(0,0) }, 60) }, 1400)
    return()=>clearTimeout(t)
  },[])

  // Cursor + magnetic + tilt - Ayzz core
  useEffect(()=>{
    if(loading) return
    const cursor = cursorRef.current
    const label = cursorLabelRef.current
    let mx=window.innerWidth/2, my=window.innerHeight/2, cx=mx, cy=my, raf
    const onMove = (e)=>{ mx=e.clientX; my=e.clientY
      // tilt for .tilt
      document.querySelectorAll('.tilt').forEach(el=>{
        const r=el.getBoundingClientRect()
        const inside = e.clientX>r.left && e.clientX<r.right && e.clientY>r.top && e.clientY<r.bottom
        if(inside){
          const x=(e.clientX-r.left-r.width/2)/10
          const y=(e.clientY-r.top-r.height/2)/10
          gsap.to(el, { rotationY:x, rotationX:-y, duration:0.6, ease:"power3.out", transformPerspective:900 })
        } else {
          gsap.to(el, { rotationY:0, rotationX:0, duration:0.9, ease:"power3.out" })
        }
      })
      // magnetic buttons
      document.querySelectorAll('[data-magnetic]').forEach(btn=>{
        const r=btn.getBoundingClientRect()
        const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2)
        const dist=Math.hypot(dx,dy)
        if(dist<180){
          gsap.to(btn, { x:dx*0.28, y:dy*0.32, duration:0.5, ease:"power3.out" })
        } else {
          gsap.to(btn, { x:0, y:0, duration:0.7, ease:"power3.out" })
        }
      })
      // floating blobs follow
      gsap.to('.blob-a', { x:(mx-window.innerWidth/2)*0.04, y:(my-window.innerHeight/2)*0.03, duration:1.2, ease:"power3.out" })
      gsap.to('.blob-b', { x:(mx-window.innerWidth/2)*-0.03, y:(my-window.innerHeight/2)*-0.02, duration:1.4, ease:"power3.out" })
    }
    const loop=()=>{
      cx+=(mx-cx)*0.14; cy+=(my-cy)*0.14
      if(cursor) cursor.style.transform=`translate3d(${cx-16}px, ${cy-16}px, 0)`
      raf=requestAnimationFrame(loop)
    }
    loop()
    const enter=()=>{ gsap.to(cursor,{scale:1.6, duration:0.3}); if(label) label.style.opacity='1' }
    const leave=()=>{ gsap.to(cursor,{scale:1, duration:0.3}); if(label) label.style.opacity='0' }
    const hoverTargets = document.querySelectorAll('a, button, .tilt')
    hoverTargets.forEach(el=>{
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })
    window.addEventListener('mousemove', onMove)
    return()=>{
      cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove)
      hoverTargets.forEach(el=>{
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      })
    }
  },[loading])

  // GSAP Ayzz scroll choreography
  useEffect(()=>{
    const ctx=gsap.context(()=>{
      // hero massive text reveal - only after loader
      if(!loading){
        const tl=gsap.timeline({delay:0.2})
        tl.from(".nav-pill", { y:-60, opacity:0, duration:0.9, ease:"expo.out" })
        tl.from(".hero-kicker", { y:20, opacity:0, duration:0.7, ease:"power3.out" }, "-=0.6")
        tl.from(".hero-line span", { yPercent:125, opacity:0, duration:1.05, stagger:0.08, ease:"expo.out" }, "-=0.4")
        tl.from(".hero-desc", { y:16, opacity:0, duration:0.7, ease:"power3.out" }, "-=0.6")
        tl.from(".hero-actions > *", { y:18, opacity:0, duration:0.6, stagger:0.09, ease:"power3.out" }, "-=0.5")
        tl.from(".hero-card", { y:60, opacity:0, rotation:2, duration:1.0, stagger:0.12, ease:"expo.out" }, "-=0.8")
        gsap.from(".hero-img-main", { scale:1.22, duration:1.8, ease:"expo.out", delay:0.4 })
      }

      // continuous float
      gsap.to(".float-a", { y:-14, duration:2.1, repeat:-1, yoyo:true, ease:"sine.inOut" })
      gsap.to(".float-b", { y:14, duration:2.5, repeat:-1, yoyo:true, ease:"sine.inOut", delay:0.25 })
      gsap.to(".float-c", { y:-10, rotation:1.2, duration:2.8, repeat:-1, yoyo:true, ease:"sine.inOut", delay:0.5 })

      // hero is now frame film - pin handled in frame sync below (no separate scale)

      // section reveals - Ayzz editorial
      gsap.utils.toArray(".reveal").forEach(el=>{
        gsap.from(el, { y:80, opacity:0, duration:1.0, ease:"expo.out", scrollTrigger:{ trigger:el, start:"top 86%" } })
      })
      gsap.utils.toArray(".stagger > *").forEach((el,i)=>{
        gsap.from(el, { y:50, opacity:0, duration:0.8, delay:i*0.06, ease:"power3.out", scrollTrigger:{ trigger:el.parentElement, start:"top 86%" } })
      })
      // horizontal track parallax
      const track = trackRef.current
      if(track){
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 48),
          ease:"none",
          scrollTrigger:{
            trigger: track,
            start:"top 82%",
            end:()=> "+=" + (track.scrollWidth - window.innerWidth),
            scrub:0.9,
            invalidateOnRefresh:true
          }
        })
      }
      // image clip reveal
      gsap.from(".about-clip", { clipPath:"inset(0 100% 0 0)", duration:1.4, ease:"expo.inOut", scrollTrigger:{ trigger:".about-grid", start:"top 72%" } })

      // FIXED HERO - INSTANT SCRUB (no 1s wait, no auto-skip)
      const canvas = canvasRef.current
      const video = videoRef.current
      const wrap = heroTriggerRef.current
      if(wrap && canvas){
        const ctx = canvas.getContext('2d')
        const tryLoad = (src)=> new Promise(res=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=()=>res(null); img.src=src })
        const imgs=[]
        let scrubReady=false
        const draw = (idx)=>{
          const img = imgs[idx]
          if(!img || !canvas) return
          const cw=canvas.width, ch=canvas.height
          if(!cw||!ch) return
          const ir=img.width/img.height, cr=cw/ch
          let dw, dh, dx, dy
          if(ir>cr){ dh=ch; dw=ch*ir; dx=(cw-dw)/2; dy=0 } else { dw=cw; dh=cw/ir; dx=0; dy=(ch-dh)/2 }
          ctx.clearRect(0,0,cw,ch)
          ctx.drawImage(img, dx, dy, dw, dh)
        }
        const resize = ()=>{
          canvas.width=window.innerWidth*(window.devicePixelRatio||1)
          canvas.height=window.innerHeight*(window.devicePixelRatio||1)
          canvas.style.width=window.innerWidth+'px'
          canvas.style.height=window.innerHeight+'px'
          if(imgs[0]) draw(0)
        }
        resize()
        window.addEventListener('resize', resize)
        // create scrub IMMEDIATELY - no wait for 240 frames, so first second scroll works
        const st = ScrollTrigger.create({
          trigger: wrap,
          start:"top top",
          end:"bottom top",
          scrub:0.6,
          onUpdate:self=>{
            if(imgs.length>0){
              const idx=Math.min(imgs.length-1, Math.floor(self.progress*(imgs.length-1)))
              requestAnimationFrame(()=>draw(idx))
            }
            gsap.to(".video-progress", { scaleX: self.progress, duration:0.15, overwrite:true })
          }
        })
        // async load frames in background - first frame instantly, then rest
        ;(async()=>{
          const first = await tryLoad(`frames/frame_0001.png`) || await tryLoad(`frames/frame_0001.jpg`)
          if(first){
            imgs.push(first)
            framesRef.current=imgs
            setFrameMode(true)
            canvas.style.display='block'
            if(video) video.style.display='none'
            canvas.style.background='none'
            draw(0)
            // load rest in background without blocking scrub
            for(let i=2;i<=frameCount;i++){
              const n=`frames/frame_${String(i).padStart(4,'0')}.jpg`
              const f=`frames/frame_${String(i).padStart(4,'0')}.png`
              let img = await tryLoad(n)
              if(!img) img = await tryLoad(f)
              if(img) imgs.push(img)
              // update scrub to use more frames as they arrive (already handled via imgs.length)
            }
            framesRef.current=imgs
          } else {
            // no frames - fallback to video, switch scrub to video
            st.kill()
            if(canvas) canvas.style.display='none'
            if(video) video.style.display='block'
            let dur=0
            const setDur=()=>{ dur=video.duration||8 }
            video.addEventListener('loadedmetadata', setDur)
            setDur()
            ScrollTrigger.create({
              trigger: wrap,
              start:"top top",
              end:"bottom top",
              scrub:1.2,
              onUpdate:self=>{
                if(!dur) return
                const t=self.progress*dur
                gsap.to(video, { currentTime:t, duration:0.4, ease:"power2.out", overwrite:true })
                gsap.to(".video-progress", { scaleX: self.progress, duration:0.15, overwrite:true })
              }
            })
          }
        })()
      }
    })
    return()=>ctx.revert()
  },[loading])

  const add=(n)=>{ setToast(n+" — noted"); setTimeout(()=>setToast(null), 2200) }

  return (
    <div style={{background:"#FCFBF7", color:"#1A0F0A", overflowX:"hidden", position:"relative"}}>
      {/* natural blurred backdrop - little blur, not full visible */}
      <div style={{position:"fixed", inset:0, zIndex:0, background:"url(https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&q=80) center/cover no-repeat", filter:"blur(8px) saturate(1.2) brightness(1.02)", opacity:0.38, pointerEvents:"none", transform:"scale(1.04)"}} aria-hidden="true" />
      <div style={{position:"fixed", inset:0, zIndex:0, background:"linear-gradient(180deg, rgba(252,251,247,0.32), rgba(252,251,247,0.48))", pointerEvents:"none"}} aria-hidden="true" />
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>

      {/* progress */}
      <motion.div style={{position:"fixed", top:0, left:0, right:0, height:2.5, background:"#FF4D2E", transformOrigin:"0%", zIndex:90, scaleX: scrollYProgress }} />

      {/* cursor */}
      <div ref={cursorRef} style={{position:"fixed", top:0, left:0, width:32, height:32, borderRadius:"50%", border:"1px solid #1A0F0A", pointerEvents:"none", zIndex:85, display:"none", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.0)"}} className="cursor">
        <div style={{width:6, height:6, background:"#1A0F0A", borderRadius:"50%"}}/>
        <span ref={cursorLabelRef} style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontSize:8, fontWeight:800, letterSpacing:"0.12em", opacity:0, transition:"opacity 0.2s", background:"#1A0F0A", color:"#fff", padding:"2px 6px", borderRadius:999, whiteSpace:"nowrap"}}>VIEW</span>
      </div>

      <AnimatePresence>{toast && <motion.div initial={{y:24, opacity:0, x:"-50%"}} animate={{y:0, opacity:1, x:"-50%"}} exit={{y:24, opacity:0, x:"-50%"}} style={{position:"fixed", bottom:22, left:"50%", background:"#1A0F0A", color:"#fff", padding:"12px 18px", borderRadius:999, fontSize:13, fontWeight:700, zIndex:80, display:"flex", gap:10, alignItems:"center"}}><span style={{width:8, height:8, background:"#FF4D2E", borderRadius:"50%"}}/> {toast}</motion.div>}</AnimatePresence>
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(null)} style={{position:"fixed", inset:0, zIndex:85, background:"rgba(8,6,6,0.92)", backdropFilter:"blur(10px)", display:"grid", placeItems:"center", padding:"20px", cursor:"zoom-out"}}>
            <motion.div initial={{scale:0.92, y:12, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.96, opacity:0}} transition={{type:"spring", stiffness:260, damping:22}} onClick={e=>e.stopPropagation()} style={{position:"relative", width:"min(92vw, 900px)", maxHeight:"86vh", borderRadius:20, overflow:"hidden", border:"1px solid rgba(255,255,255,0.18)", background:"#0a0a0a", boxShadow:"0 24px 80px rgba(0,0,0,0.5)"}}>
              <img src={lightbox.img.replace('w=600','w=1600')} alt={lightbox.t} style={{width:"100%", height:"auto", maxHeight:"86vh", objectFit:"cover", display:"block"}} />
              <div style={{position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(180deg, transparent, rgba(0,0,0,0.72))", padding:"18px 16px 14px", display:"flex", justifyContent:"space-between", alignItems:"end", color:"#fff"}}>
                <div>
                  <div style={{fontFamily:"Cormorant Garamond", fontSize:22, fontWeight:600}}>{lightbox.t}</div>
                  <div style={{fontSize:12, opacity:0.8, letterSpacing:"0.08em", marginTop:2}}>{lightbox.n} BOUQUETS • Tap outside to close</div>
                </div>
                <button onClick={()=>setLightbox(null)} style={{background:"#fff", color:"#1A0F0A", border:"none", borderRadius:999, padding:"8px 14px", fontWeight:800, fontSize:12}}>✕ CLOSE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating nav pill - Ayzz style */}
      <div className="nav-pill" style={{position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:50, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(18px) saturate(1.5)", border:"1px solid #EDE6DA", borderRadius:999, padding:"8px 10px 8px 14px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 12px 40px rgba(0,0,0,0.10)", width:"min(92vw, 860px)", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:32, height:32, borderRadius:"50%", background:"#1A0F0A", color:"#FFD6D9", display:"grid", placeItems:"center", fontFamily:"Instrument Serif", fontStyle:"italic"}}>p</div>
          <span style={{fontFamily:"Cormorant Garamond", fontWeight:800, letterSpacing:"0.14em", fontSize:13}}>PÉTAL & BLOOM</span>
          <span style={{fontSize:9, letterSpacing:"0.14em", opacity:0.45, display:"none"}} className="hide-desk">— SHAHPUR JAT</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <div style={{display:"flex", gap:14, fontSize:12, fontWeight:700, letterSpacing:"0.1em"}} className="hide-mob">
            <a href="#shop" style={{color:"#1A0F0A", textDecoration:"none"}}>SHOP</a>
            <a href="#occasions" style={{color:"#1A0F0A", textDecoration:"none"}}>OCCASIONS</a>
            <a href="#gallery" style={{color:"#1A0F0A", textDecoration:"none"}}>GALLERY</a>
          </div>
          <button onClick={()=>setMenu(v=>!v)} style={{width:36, height:36, borderRadius:"50%", background:"#fff", border:"1px solid #EDE6DA", display:"grid", placeItems:"center"}} className="show-mob">☰</button>
        </div>
      </div>
      {menu && <div style={{position:"fixed", inset:0, background:"rgba(252,251,247,0.96)", backdropFilter:"blur(14px)", zIndex:49, display:"grid", placeItems:"center", gap:14}}>
        <div style={{display:"flex", flexDirection:"column", gap:18, textAlign:"center", fontSize:22, fontWeight:700, fontFamily:"Cormorant Garamond"}}>
          <a href="#shop" onClick={()=>setMenu(false)} style={{color:"#1A0F0A", textDecoration:"none"}}>SHOP</a>
          <a href="#occasions" onClick={()=>setMenu(false)} style={{color:"#1A0F0A", textDecoration:"none"}}>OCCASIONS</a>
          <a href="#gallery" onClick={()=>setMenu(false)} style={{color:"#1A0F0A", textDecoration:"none"}}>GALLERY</a>
          <button onClick={()=>setMenu(false)} style={{marginTop:10, background:"#1A0F0A", color:"#fff", border:"none", borderRadius:999, padding:"12px 22px"}}>CLOSE</button>
        </div>
      </div>}

      {/* HERO - FIXED FRAME-BY-FRAME (no pin glitch, truly fixed) */}
      <section ref={heroWrapRef} style={{position:"fixed", top:0, left:0, right:0, height:"100vh", overflow:"hidden", background:"#0B0B0B", zIndex:1}}>
        <canvas ref={canvasRef} style={{position:"absolute", inset:0, width:"100%", height:"100%", display:"block", background:"url(https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80) center/cover no-repeat"}} />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80"
          style={{position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.68) saturate(1.12)", display:"none"}}
          src="https://videos.pexels.com/video-files/856309/856309-hd_1920_1080_30fps.mp4"
        />
        <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.08) 32%, rgba(0,0,0,0.58) 100%)"}}/>
        <div className="blob-a" style={{position:"absolute", width:520, height:520, background:"radial-gradient(circle at 30% 30%, rgba(255,214,217,0.35) 0%, transparent 62%)", borderRadius:"50%", left:-80, top:80, opacity:0.8, mixBlendMode:"screen"}}/>
        <div className="blob-b" style={{position:"absolute", width:560, height:560, background:"radial-gradient(circle at 50% 50%, rgba(255,233,168,0.28) 0%, transparent 62%)", borderRadius:"50%", right:-60, top:40, opacity:0.7, mixBlendMode:"screen"}}/>

        {/* hero overlay content - CLEAN */}
        <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"90px 20px 80px", color:"#fff"}}>
          <h1 style={{fontFamily:"Cormorant Garamond", lineHeight:0.92, fontWeight:300, textShadow:"0 8px 32px rgba(0,0,0,0.45)", padding:"8px 0"}}>
            <div className="hero-line" style={{overflow:"visible", paddingBottom:4}}><span style={{display:"inline-block", fontSize:"clamp(56px, 11vw, 148px)", fontWeight:600, fontStyle:"italic", letterSpacing:"-0.03em", lineHeight:1.0}}>Flowers</span></div>
            <div className="hero-line" style={{overflow:"visible", display:"flex", justifyContent:"center", gap:"3vw", alignItems:"baseline", flexWrap:"wrap", paddingBottom:6}}>
              <span style={{display:"inline-block", fontSize:"clamp(44px, 8.5vw, 108px)", letterSpacing:"-0.02em", lineHeight:1.0}}>that speak</span>
              <span style={{display:"inline-block", fontFamily:"Instrument Serif", fontStyle:"italic", fontSize:"clamp(48px, 9vw, 120px)", color:"#FFD6D9", lineHeight:1.0}}>poetry.</span>
            </div>
          </h1>
        </div>

        {/* bottom progress + hint */}
        <div style={{position:"absolute", bottom:0, left:0, right:0, height:2, background:"rgba(255,255,255,0.18)"}}>
          <div className="video-progress hero-progress" style={{height:"100%", background:"#FF4D2E", transformOrigin:"0%", transform:"scaleX(0)"}}/>
        </div>
        <div style={{position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,0.92)", fontSize:11, letterSpacing:"0.14em", fontWeight:700, display:"flex", gap:8, alignItems:"center", background:"rgba(0,0,0,0.32)", backdropFilter:"blur(8px)", padding:"7px 14px", borderRadius:999, border:"1px solid rgba(255,255,255,0.18)"}}>
          <span>↕</span> SCROLL SLOWLY — YOUR FRAMES BLOOM <span>↕</span>
        </div>
        {!frameMode && (
          <div style={{position:"absolute", top:62, left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,0,0.52)", color:"#fff", padding:"6px 12px", borderRadius:999, fontSize:10, fontWeight:600, border:"1px solid rgba(255,255,255,0.18)"}}>
            No frames — using video fallback. Add <span style={{background:"#fff", color:"#000", padding:"1px 6px", borderRadius:4}}>frame_*.png</span> to /public/frames/
          </div>
        )}
      </section>
      {/* spacer drives fixed hero scrub - no pin glitch */}
      <div ref={heroTriggerRef} style={{height:"260vh", pointerEvents:"none"}} aria-hidden="true" />

      <div style={{position:"relative", zIndex:2, background:"rgba(252,251,247,0.42)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)"}}>
      <div className="marquee" style={{background:"#1A0F0A", color:"#FCFBF7", borderTop:"1px solid #1A0F0A", borderBottom:"1px solid #1A0F0A"}}>
        <div className="marquee-track">
          {Array.from({length:6}).map((_,i)=><span key={i} style={{fontFamily:"Instrument Serif", fontStyle:"italic", fontSize:16}}>✦ Zero plastic — paper only &nbsp; ✦ 5am Ghazipur pick &nbsp; ✦ Free handwritten card &nbsp; ✦</span>)}
          {Array.from({length:6}).map((_,i)=><span key={"b"+i} style={{fontFamily:"Instrument Serif", fontStyle:"italic", fontSize:16}}>✦ Zero plastic — paper only &nbsp; ✦ 5am Ghazipur pick &nbsp; ✦ Free handwritten card &nbsp; ✦</span>)}
        </div>
      </div>

      <section id="shop" style={{padding:"36px 0 20px"}}>
        <div className="container">
          <div style={{display:"grid", gridTemplateColumns:"1fr", gap:18}} className="shop-grid">
            <div style={{position:"sticky", top:88, alignSelf:"start"}}>
              <div style={{fontSize:10, letterSpacing:"0.2em", fontWeight:800, opacity:0.5, display:"flex", gap:8, alignItems:"center"}}><span style={{width:28, height:1, background:"#1A0F0A", display:"inline-block"}}/> SPRING 2026 — EDITOR'S PICK</div>
              <h2 style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(32px, 5vw, 56px)", lineHeight:0.88, fontWeight:300, marginTop:8}}>Bouquets people <br/><i style={{fontFamily:"Instrument Serif", color:"#FF4D2E"}}>can't forget</i></h2>
              <p style={{marginTop:10, color:"#6B4A3A", lineHeight:1.65, fontSize:14, maxWidth:340}}>Six atelier ties, GPU-melt between them. No tilt gimmick — just bloom.</p>
              <div style={{marginTop:14, background:"#fff", border:"1px solid #1A0F0A", borderRadius:20, padding:14, display:"grid", gap:8}}>
                <div style={{fontSize:10, letterSpacing:"0.12em", fontWeight:800, opacity:0.6}}>{products[morphIndex].tag}</div>
                <div style={{fontFamily:"Cormorant Garamond", fontSize:22, fontWeight:600}}>{products[morphIndex].name}</div>
                <div style={{fontSize:11, opacity:0.5}}>350g • 18 stems • Atelier tied</div>
                <button onClick={()=>add(products[morphIndex].name)} data-magnetic style={{background:"#1A0F0A", color:"#fff", border:"none", borderRadius:999, padding:"12px 16px", fontWeight:800, marginTop:4}}>VIEW BOUQUET →</button>
                <div style={{display:"flex", gap:6, marginTop:6, flexWrap:"wrap"}}>
                  {products.map((p,i)=>(
                    <button key={p.id} onClick={()=>add(p.name)} title={`Add ${p.name}`} style={{width:32, height:32, borderRadius:"50%", border: i===morphIndex ? "2px solid #1A0F0A" : "1px solid #EDE6DA", overflow:"hidden", padding:0, cursor:"pointer", opacity: i===morphIndex ? 1 : 0.7}}>
                      <img src={p.img} alt={p.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginTop:10, fontSize:11, letterSpacing:"0.12em", fontWeight:700, opacity:0.5, display:"flex", gap:8, alignItems:"center"}}><span style={{width:18, height:1, background:"#1A0F0A"}}/> SWIPE TO BLOOM • AUTO MELT</div>
            </div>
            <div style={{height:"560px", position:"relative", borderRadius:24, overflow:"hidden", border:"1px solid #1A0F0A", boxShadow:"0 20px 50px rgba(0,0,0,0.12)"}}>
              <MorphSlider
                items={morphItems}
                transition="swirl"
                intensity={0.62}
                aberration={0.28}
                drift={0.18}
                autoplay
                autoplayDelay={3.0}
                radius={24}
                overlayColor="#0a0a0a"
                showCaptions
                showControls
                showIndicators
                onSlideChange={setMorphIndex}
              />
            </div>
          </div>
        </div>
        <style>{`@media(min-width:900px){ .shop-grid{ grid-template-columns: 360px 1fr !important; gap:22px !important; } }`}</style>
      </section>

      <section id="occasions" style={{padding:"28px 0"}}>
        <div className="container">
          <div className="reveal" style={{background:"#1A0F0A", color:"#FCFBF7", borderRadius:28, padding:18, display:"grid", gap:14}}>
            <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, alignItems:"center"}}>
              <h3 style={{fontFamily:"Cormorant Garamond", fontSize:30, fontWeight:400}}>Pick an <i style={{fontFamily:"Instrument Serif", color:"#FFD6D9"}}>occasion</i>, we'll write the words.</h3>
              <span style={{fontSize:10, letterSpacing:"0.16em", opacity:0.6}}>TILT ON HOVER →</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10}} className="stagger">
              {[
                {t:"Birthdays", img:"https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600&q=80", n:"24"},
                {t:"Anniversaries", img:"https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80", n:"18"},
                {t:"Apologies", img:"https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&q=80", n:"12"},
                {t:"Just Because", img:"https://images.unsplash.com/photo-1490772888775-55fceea286b8?w=600&q=80", n:"30"},
              ].map(o=>(
                <div key={o.t} onClick={()=>setLightbox(o)} className="tilt" style={{height:168, borderRadius:20, overflow:"hidden", position:"relative", border:"1px solid rgba(255,255,255,0.12)", cursor:"zoom-in", transformStyle:"preserve-3d"}}>
                  <img src={o.img} style={{width:"100%", height:"100%", objectFit:"cover"}} alt={o.t}/>
                  <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent, rgba(0,0,0,0.6))"}}/>
                  <div style={{position:"absolute", bottom:12, left:12}}><div style={{fontFamily:"Cormorant Garamond", fontSize:18, fontWeight:600}}>{o.t}</div><div style={{fontSize:11, opacity:0.7, letterSpacing:"0.1em"}}>{o.n} BOUQUETS</div></div>
                  <div style={{position:"absolute", top:10, right:10, width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.94)", color:"#1A0F0A", display:"grid", placeItems:"center", fontWeight:800}}>→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WONDERFUL GALLERY - FULLSCREEN DRIFTWALL */}
      <section id="gallery" style={{padding:"32px 0 0"}}>
        <div className="container">
          <div className="reveal" style={{display:"flex", justifyContent:"space-between", alignItems:"end", gap:12, flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:10, letterSpacing:"0.2em", fontWeight:800, opacity:0.5}}>WONDERFUL GALLERY — FULLSCREEN WALL</div>
              <h2 style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(30px, 4.6vw, 52px)", lineHeight:0.9, fontWeight:300, marginTop:6}}>Now <i style={{fontFamily:"Instrument Serif", color:"#FF4D2E"}}>fullscreen.</i></h2>
              <p style={{fontSize:13, color:"#6B4A3A", marginTop:6}}>No box — edge to edge drift. Same grayscale → colour bloom, now cinematic.</p>
            </div>
            <div style={{fontSize:12, fontWeight:700, opacity:0.55}}>8 blooms • fullscreen • hover to bloom →</div>
          </div>
        </div>
        <div style={{height:"100vh", width:"100%", background:"#0a0a0a", marginTop:14}}>
          <DriftWall
              items={[
                { image:"https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80", title:"Morning Harvest" },
                { image:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80", title:"Wild Meadow" },
                { image:"https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80", title:"Midnight Peony" },
                { image:"https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80", title:"Citrus Light" },
                { image:"https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&q=80", title:"Atelier Bloom" },
                { image:"https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80", title:"Preserved Glass" },
                { image:"https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&q=80", title:"Tulip Field" },
                { image:"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80", title:"Velvet Box" },
                { image:"https://images.unsplash.com/photo-1490772888775-55fceea286b8?w=800&q=80", title:"Blush Ballroom" },
                { image:"https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=800&q=80", title:"Rose Close" },
                { image:"https://images.unsplash.com/photo-1504567961542-e24d9439a724?w=800&q=80", title:"Citrus Garden" },
                { image:"https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800&q=80", title:"Sunlit Garden" },
              ]}
            columns={6}
            tileWidth={280}
            tileHeight={190}
            gap={18}
            tilt={14}
            turn={-12}
            perspective={1100}
            depth={100}
              speed={28}
              direction="up"
              variance={0.45}
              parallax={0.6}
              lift={48}
              fade={0}
              dim={1}
              grayscale={true}
              overlayColor="transparent"
          />
        </div>
        <div className="container" style={{display:"flex", justifyContent:"center", marginTop:16, paddingBottom:16}}>
          <button data-magnetic onClick={()=>add("Gallery — View All")} style={{background:"#1A0F0A", color:"#fff", border:"none", borderRadius:999, padding:"12px 22px", fontWeight:800}}>VIEW FULL GALLERY (42) →</button>
        </div>
      </section>

      <section style={{padding:"18px 0"}}>
        <div className="container">
          <div className="reveal" style={{background:"#FFE9E3", border:"1px solid #1A0F0A", borderRadius:28, padding:22, position:"relative", overflow:"hidden"}}>
            <div style={{position:"absolute", fontSize:120, opacity:0.05, top:-8, right:18, fontFamily:"Cormorant Garamond"}}>“</div>
            <div style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(22px, 3.2vw, 34px)", lineHeight:1.12}}>“Ordered at 2pm for my mom's 60th. Came at 5pm with <span style={{background:"#fff", padding:"0 6px", borderRadius:6}}>handwritten note + extra peonies</span>. We both cried. 10/10.”</div>
            <div style={{display:"flex", alignItems:"center", gap:12, marginTop:14}}>
              <img src="https://i.pravatar.cc/100?img=33" style={{width:44, height:44, borderRadius:"50%"}} alt=""/>
              <div><div style={{fontWeight:800}}>Sarah — Lajpat Nagar</div><div style={{fontSize:12, opacity:0.6}}>Verified • Eternal Blush • today</div></div>
              <div style={{marginLeft:"auto", color:"#FF4D2E"}}>★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{background:"#0a0a0a", color:"#FCFBF7", padding:"64px 20px", position:"relative", overflow:"hidden", zIndex:2, borderRadius:"16px", margin:"12px"}}>
        <div style={{position:"absolute", width:720, height:720, background:"radial-gradient(circle, #FF4D2E 0%, transparent 70%)", opacity:0.14, left:"50%", top:"50%", transform:"translate(-50%,-50%)", borderRadius:"50%"}}/>
        <div style={{position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 0%, rgba(255,77,46,0.08), transparent 60%)"}}/>
        <div style={{textAlign:"center", maxWidth:720, margin:"0 auto", position:"relative"}}>
          <div style={{fontSize:11, letterSpacing:"0.2em", fontWeight:800, opacity:0.5}}>BEFORE 4PM • DELHI & MUMBAI</div>
          <div style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(42px, 8vw, 84px)", lineHeight:0.88, marginTop:12}}>Send flowers <i style={{fontFamily:"Instrument Serif", color:"#FFD6D9"}}>today.</i></div>
          <p style={{opacity:0.72, maxWidth:560, margin:"16px auto 0", lineHeight:1.7, fontSize:16}}>Free handwritten card. We write what you feel — beautifully. Paper, not plastic.</p>
          <div style={{display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginTop:22}}>
            <input placeholder="Your email for 15% off" style={{background:"#fff", border:"none", borderRadius:999, padding:"16px 20px", minWidth:320, outline:"none", fontSize:14}}/>
            <button data-magnetic onClick={()=>add("Email")} style={{background:"#FF4D2E", color:"#fff", border:"none", borderRadius:999, padding:"16px 26px", fontWeight:800, fontSize:14}}>GET CODE →</button>
          </div>
          <div style={{fontSize:11, letterSpacing:"0.12em", opacity:0.45, marginTop:14}}>✦ JOIN 18,000+ WHO GET FRIDAY FLOWER NOTES</div>
        </div>
      </section>

      </div>
      <footer style={{position:"relative", zIndex:2, background:"#FFF1E6", borderTop:"1px solid #1A0F0A", padding:"22px 0"}}>
        <div className="container" style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:14, fontSize:11, letterSpacing:"0.1em", opacity:0.6}}>
          <span>© 2026 PÉTAL & BLOOM • MADE WITH 🌸 IN DELHI • AYZZ-INSPIRED</span><span>PRIVACY • TERMS</span>
        </div>
      </footer>

      <style>{`
        .container{ max-width:1180px; margin:0 auto; padding:0 20px; }
        .marquee{ overflow:hidden; white-space:nowrap; } .marquee-track{ display:inline-flex; animation:marquee 18s linear infinite; } .marquee-track span{ padding:14px 22px; }
        @keyframes marquee{ 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .hide-mob{ display:none; } .show-mob{ display:grid; } .cursor{ display:none !important; }
        @media(min-width:860px){ .hide-mob{ display:flex; } .show-mob{ display:none !important; } .cursor{ display:flex !important; } .hide-desk{ display:inline !important; } .hero-cards{ grid-template-columns: 1.25fr 0.75fr !important; } .about-grid{ grid-template-columns: 0.95fr 1.05fr !important; } }
        .tilt{ will-change: transform; }
        .gallery-img:hover{ transform: scale(1.06); }
        ::selection{ background:#FFD6D9; }
      `}</style>
    </div>
  )
}

function Loader(){
  const [n,setN]=useState(0)
  useEffect(()=>{
    let v=0; const id=setInterval(()=>{ v=Math.min(100, v+ Math.random()*18); setN(Math.floor(v)); if(v>=100) clearInterval(id) }, 90)
    return()=>clearInterval(id)
  },[])
  return (
    <motion.div initial={{opacity:1}} exit={{y:"-100%", transition:{duration:0.8, ease:[0.76,0,0.24,1]}}} style={{position:"fixed", inset:0, zIndex:100, background:"#FCFBF7", display:"grid", placeItems:"center"}}>
      <div style={{textAlign:"center", width:"min(92vw, 520px)"}}>
        <div style={{display:"flex", justifyContent:"space-between", fontSize:10, letterSpacing:"0.18em", fontWeight:800, opacity:0.5}}><span>PÉTAL & BLOOM</span><span>ATELIER 2012</span></div>
        <div style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(48px, 9vw, 84px)", lineHeight:0.9, marginTop:18, fontWeight:300, overflow:"hidden"}}>
          <motion.div initial={{y:"100%"}} animate={{y:"0%", transition:{duration:0.9, ease:"easeOut", delay:0.2}}} style={{fontStyle:"italic", fontWeight:600}}>blooming</motion.div>
          <motion.div initial={{y:"100%"}} animate={{y:"0%", transition:{duration:0.9, ease:"easeOut", delay:0.32}}} style={{fontFamily:"Instrument Serif", color:"#FF4D2E"}}>your garden</motion.div>
        </div>
        <div style={{height:1, background:"#EDE6DA", marginTop:22, position:"relative", overflow:"hidden"}}>
          <motion.div initial={{scaleX:0}} animate={{scaleX:1, transition:{duration:1.9, ease:"easeInOut"}}} style={{position:"absolute", inset:0, background:"#1A0F0A", transformOrigin:"0%"}}/>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, fontWeight:700, letterSpacing:"0.1em"}}><span>{n}% — LOADING POETRY</span><span style={{opacity:0.5}}>AYZZ EDITION</span></div>
      </div>
    </motion.div>
  )
}
