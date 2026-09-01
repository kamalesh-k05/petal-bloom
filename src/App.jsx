import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// --- DATA ---
const products = [
  { id:1, name:"Eternal Blush", price: "₹ 2,499", img:"https://images.unsplash.com/photo-1563241527-3004b7be0ee9?w=600&q=80", tag:"BESTSELLER", color:"#FFD6D9" },
  { id:2, name:"Midnight Peony", price: "₹ 3,299", img:"https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80", tag:"NEW", color:"#E8D5FF" },
  { id:3, name:"Citrus Garden", price: "₹ 1,899", img:"https://images.unsplash.com/photo-1487070183336-baaa0eb325dd?w=600&q=80", tag:"LIMITED", color:"#FFE7A0" },
  { id:4, name:"Wild Meadow", price: "₹ 2,149", img:"https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80", tag:"SEASONAL", color:"#C8E6C9" },
  { id:5, name:"Velvet Rose Box", price: "₹ 4,500", img:"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80", tag:"LUXE", color:"#FFCAD4" },
  { id:6, name:"Sunlit Tulips", price: "₹ 1,650", img:"https://images.unsplash.com/photo-1524386416438-a8aee5376424?w=600&q=80", tag:"FRESH", color:"#FFF1A8" },
]

export default function App(){
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState(null)
  const heroRef = useRef(null)
  const petalsRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05])

  // Lenis
  useEffect(()=>{
    const lenis = new Lenis({ duration:1.2, easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)) })
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return ()=> lenis.destroy()
  },[])

  // Loader
  useEffect(()=>{
    const t = setTimeout(()=> setLoading(false), 1900)
    return ()=> clearTimeout(t)
  },[])

  // GSAP animations
  useEffect(()=>{
    if(loading) return
    const ctx = gsap.context(()=>{
      // nav reveal
      gsap.from(".nav-anim", { y:-40, opacity:0, duration:0.8, stagger:0.08, ease:"power3.out", delay:0.1 })
      // hero text chars
      gsap.from(".hero-title span", { yPercent:120, opacity:0, duration:0.9, stagger:0.06, ease:"expo.out", delay:0.3 })
      gsap.from(".hero-sub", { y:20, opacity:0, duration:0.8, ease:"power3.out", delay:0.9 })
      gsap.from(".hero-cta", { y:16, opacity:0, duration:0.7, stagger:0.12, ease:"power3.out", delay:1.0 })

      // hero image parallax
      gsap.from(".hero-img", { scale:1.15, duration:1.8, ease:"power3.out", delay:0.4 })
      gsap.to(".float-card-1", { y:-14, duration:2, repeat:-1, yoyo:true, ease:"sine.inOut" })
      gsap.to(".float-card-2", { y:12, duration:2.4, repeat:-1, yoyo:true, ease:"sine.inOut", delay:0.3 })
      gsap.to(".float-blur", { scale:1.08, duration:3, repeat:-1, yoyo:true, ease:"sine.inOut" })

      // scroll triggers
      gsap.utils.toArray(".reveal-up").forEach((el)=>{
        gsap.from(el, {
          y:60, opacity:0, duration:0.9, ease:"power3.out",
          scrollTrigger:{ trigger:el, start:"top 88%", toggleActions:"play none none reverse" }
        })
      })
      gsap.utils.toArray(".reveal-stagger > *").forEach((el,i)=>{
        gsap.from(el, {
          y:40, opacity:0, duration:0.7, delay:i*0.08, ease:"power3.out",
          scrollTrigger:{ trigger:el.parentElement, start:"top 85%" }
        })
      })
      gsap.from(".about-img", {
        clipPath:"inset(0 100% 0 0)", duration:1.2, ease:"expo.inOut",
        scrollTrigger:{ trigger:".about-section", start:"top 70%" }
      })
      gsap.from(".bouquet-rot", { rotation: -8, duration:2.5, repeat:-1, yoyo:true, ease:"sine.inOut" })
    })
    return ()=> ctx.revert()
  },[loading])

  // petals animation (DOM petals)
  useEffect(()=>{
    if(loading) return
    const container = petalsRef.current
    if(!container) return
    const petals = []
    const emojis = ["🌸","🌷","🌺","🌹","🌻","💮"]
    for(let i=0;i<18;i++){
      const el = document.createElement("div")
      el.className="petal"
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)]
      el.style.left = Math.random()*100 + "%"
      el.style.top = -20 - Math.random()*300 + "px"
      el.style.fontSize = (14 + Math.random()*18) + "px"
      el.style.opacity = String(0.6 + Math.random()*0.4)
      container.appendChild(el)
      const dur = 8 + Math.random()*8
      const delay = Math.random()*6
      gsap.to(el, { y: window.innerHeight + 400, x: (Math.random()-0.5)*200, rotation: Math.random()*720 -360, duration: dur, delay, repeat:-1, ease:"none" })
      gsap.to(el, { opacity:0, duration:0.5, delay: delay+dur-0.5, repeat:-1 })
      petals.push(el)
    }
    return ()=> petals.forEach(p=> p.remove())
  },[loading])

  const addToCart = (name)=>{
    setCart(c=>c+1)
    setToast(name + " added to bouquet")
    setTimeout(()=> setToast(null), 2200)
  }

  return (
    <div style={{background:"#FFFBF0"}}>
      <AnimatePresence>
        {loading && <Loader />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} exit={{y:20, opacity:0}}
            style={{position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#2B1A12", color:"#fff", padding:"12px 20px", borderRadius:999, fontSize:13, fontWeight:600, zIndex:80, display:"flex", alignItems:"center", gap:10, boxShadow:"0 12px 30px rgba(0,0,0,0.15)"}}>
            <span style={{width:8,height:8,background:"#FF8FA3", borderRadius:"50%", display:"inline-block"}}/> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV */}
      <nav style={{position:"fixed", top:0, left:0, right:0, zIndex:50, background:"rgba(255,251,240,0.82)", backdropFilter:"blur(12px)", borderBottom:"1px solid #EDE6DA"}}>
        <div className="container" style={{display:"flex", alignItems:"center", justifyContent:"space-between", height:64}}>
          <div className="nav-anim" style={{display:"flex", alignItems:"center", gap:12}}>
            <div style={{width:38,height:38, background:"#2B1A12", borderRadius:"50%", display:"grid", placeItems:"center", color:"#FFD6D9", fontFamily:"Instrument Serif", fontSize:18, fontStyle:"italic"}}>p</div>
            <span style={{fontFamily:"Cormorant Garamond", fontWeight:700, letterSpacing:"0.14em", fontSize:15}}>PÉTAL & BLOOM</span>
            <span style={{display:"none", marginLeft:8, fontSize:10, letterSpacing:"0.18em", opacity:0.5}} className="hide-mobile">— SINCE 2012</span>
          </div>

          <div className="nav-anim" style={{display:"flex", alignItems:"center", gap:28}}>
            <div style={{display:"flex", gap:22, fontSize:13, fontWeight:600, letterSpacing:"0.1em"}} className="hide-mobile-nav">
              <a href="#shop" style={{textDecoration:"none", color:"#2B1A12"}}>SHOP</a>
              <a href="#occasions" style={{textDecoration:"none", color:"#2B1A12"}}>OCCASIONS</a>
              <a href="#about" style={{textDecoration:"none", color:"#2B1A12"}}>OUR STORY</a>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <button onClick={()=>addToCart("Subscription")} style={{display:"none", background:"#FFD6D9", border:"1px solid #2B1A12", borderRadius:999, padding:"8px 16px", fontSize:12, fontWeight:700, letterSpacing:"0.08em", cursor:"pointer"}} className="hide-mobile-nav">SUBSCRIBE</button>
              <button onClick={()=>addToCart("Cart")} style={{position:"relative", width:42, height:42, borderRadius:"50%", border:"1px solid #2B1A12", background:"#fff", display:"grid", placeItems:"center", cursor:"pointer"}}>
                <span style={{fontSize:16}}>🛒</span>
                {cart>0 && <span style={{position:"absolute", top:-6, right:-6, background:"#E76F51", color:"#fff", fontSize:10, fontWeight:800, width:18, height:18, borderRadius:"50%", display:"grid", placeItems:"center"}}>{cart}</span>}
              </button>
              <button onClick={()=>setMobileMenu(v=>!v)} style={{width:42,height:42, borderRadius:"50%", background:"#2B1A12", color:"#fff", border:"none", display:"grid", placeItems:"center", cursor:"pointer"}} className="mobile-only">☰</button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div style={{background:"#fff", borderTop:"1px solid #EDE6DA", padding:"18px 24px", display:"flex", flexDirection:"column", gap:14, fontSize:14, fontWeight:600, letterSpacing:"0.12em"}}>
            <a href="#shop" onClick={()=>setMobileMenu(false)} style={{color:"#2B1A12", textDecoration:"none"}}>SHOP</a>
            <a href="#occasions" onClick={()=>setMobileMenu(false)} style={{color:"#2B1A12", textDecoration:"none"}}>OCCASIONS</a>
            <a href="#about" onClick={()=>setMobileMenu(false)} style={{color:"#2B1A12", textDecoration:"none"}}>OUR STORY</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{paddingTop:64, position:"relative", overflow:"hidden"}}>
        <div ref={petalsRef} style={{position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none"}} />
        {/* background blobs */}
        <div className="float-blur" style={{position:"absolute", width:520, height:520, background:"radial-gradient(circle at 30% 30%, #FFD6D9 0%, transparent 70%)", borderRadius:"50%", left:-120, top:40, opacity:0.7}}/>
        <div className="float-blur" style={{position:"absolute", width:600, height:600, background:"radial-gradient(circle at 50% 50%, #FFF1A8 0%, transparent 65%)", borderRadius:"50%", right:-150, top:120, opacity:0.5}}/>

        <div className="container" style={{display:"grid", gridTemplateColumns:"1fr", gap:28, paddingTop:36, paddingBottom:18, position:"relative"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr", gap:14}} className="hero-grid">
            <div style={{position:"relative", zIndex:2}}>
              <div style={{display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #2B1A12", borderRadius:999, padding:"6px 12px", fontSize:11, fontWeight:700, letterSpacing:"0.14em"}}>
                <span style={{width:8,height:8, background:"#E76F51", borderRadius:"50%", animation:"pulse 1.5s infinite"}}/> FRESHLY PICKED TODAY • DELHI & MUMBAI
              </div>

              <h1 className="hero-title" style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(44px, 8vw, 84px)", lineHeight:0.88, fontWeight:300, marginTop:18, clipPath:"inset(0 0 -10% 0)"}}>
                <span style={{display:"inline-block", overflow:"hidden"}}><span style={{display:"inline-block", fontWeight:600, fontStyle:"italic"}}>Flowers</span></span> <br/>
                <span style={{display:"inline-block", overflow:"hidden"}}><span style={{display:"inline-block"}}>that speak</span></span> <br/>
                <span style={{display:"inline-block", overflow:"hidden"}}><span style={{display:"inline-block", fontFamily:"Instrument Serif", fontStyle:"italic", fontWeight:400, color:"#E76F51"}}>poetry.</span></span>
              </h1>

              <p className="hero-sub" style={{marginTop:16, fontSize:16, lineHeight:1.7, color:"#6B4A3A", maxWidth:480}}>
                Hand-tied bouquets, atelier-pressed boxes & whisper-soft dried arrangements — crafted by our artisans each morning at 5am.
              </p>

              <div className="hero-cta" style={{display:"flex", flexWrap:"wrap", gap:12, marginTop:22}}>
                <a href="#shop" style={{background:"#2B1A12", color:"#FFFBF0", padding:"14px 26px", borderRadius:999, fontSize:14, fontWeight:700, letterSpacing:"0.08em", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:10}}>
                  SHOP BOUQUETS → <span style={{background:"#fff", color:"#2B1A12", borderRadius:"50%", width:22, height:22, display:"grid", placeItems:"center", fontSize:12}}>↗</span>
                </a>
                <button onClick={()=> document.getElementById('about')?.scrollIntoView({behavior:'smooth'})} style={{background:"#fff", border:"1px solid #2B1A12", padding:"14px 22px", borderRadius:999, fontSize:14, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8}}>
                  <span style={{width:28, height:28, borderRadius:"50%", background:"#FFD6D9", display:"grid", placeItems:"center"}}>▶</span> Watch Atelier
                </button>
              </div>

              <div className="hero-cta" style={{display:"flex", gap:24, marginTop:22, alignItems:"center"}}>
                <div style={{display:"flex", alignItems:"center"}}>
                  <img src="https://i.pravatar.cc/100?img=5" style={{width:36, height:36, borderRadius:"50%", border:"2px solid #fff"}} alt=""/>
                  <img src="https://i.pravatar.cc/100?img=8" style={{width:36, height:36, borderRadius:"50%", border:"2px solid #fff", marginLeft:-10}} alt=""/>
                  <img src="https://i.pravatar.cc/100?img=14" style={{width:36, height:36, borderRadius:"50%", border:"2px solid #fff", marginLeft:-10}} alt=""/>
                  <div style={{marginLeft:8, fontSize:12, lineHeight:1.2}}>
                    <div style={{fontWeight:800}}>4.9/5 ★★★★★</div>
                    <div style={{opacity:0.6}}>from 2,847 lovers</div>
                  </div>
                </div>
                <div style={{width:1, height:36, background:"#EDE6DA"}}/>
                <div style={{fontSize:12, lineHeight:1.4}}>
                  <div style={{fontWeight:800}}>Same-day Delhi</div>
                  <div style={{opacity:0.6}}>Order by 4pm • Free card</div>
                </div>
              </div>
            </div>

            {/* HERO IMAGE COLLAGE */}
            <motion.div style={{position:"relative", height:480, y:heroY, scale:heroScale}} className="hero-visual">
              <div style={{position:"absolute", inset:0, borderRadius:32, overflow:"hidden", border:"1px solid #2B1A12", boxShadow:"0 24px 60px rgba(43,26,18,0.15)"}} className="hero-img grain">
                <img src="https://images.unsplash.com/photo-1589539979746-31d8d5bf5945?w=900&q=80" alt="bouquet" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                {/* overlay gradient */}
                <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent 55%, rgba(43,26,18,0.35) 100%)"}}/>
                <div style={{position:"absolute", bottom:16, left:16, right:16, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(10px)", borderRadius:20, padding:14, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:11, letterSpacing:"0.14em", fontWeight:800, opacity:0.6}}>TODAY'S PICK</div>
                    <div style={{fontFamily:"Cormorant Garamond", fontSize:18, fontWeight:600}}>The Blush Ballroom — ₹3,499</div>
                  </div>
                  <button onClick={()=>addToCart("Blush Ballroom")} style={{background:"#2B1A12", color:"#fff", border:"none", borderRadius:999, padding:"10px 18px", fontSize:12, fontWeight:800, cursor:"pointer"}}>ADD +</button>
                </div>
              </div>

              {/* floating cards */}
              <div className="float-card-1" style={{position:"absolute", top:18, right:-6, background:"#fff", border:"1px solid #2B1A12", borderRadius:20, padding:12, width:190, boxShadow:"0 16px 30px rgba(0,0,0,0.12)"}}>
                <div style={{fontSize:11, fontWeight:800, letterSpacing:"0.12em"}}>✦ ATELIER PRESS</div>
                <img src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80" style={{width:"100%", height:90, objectFit:"cover", borderRadius:12, marginTop:8}} alt=""/>
                <div style={{fontSize:12, fontWeight:600, marginTop:6}}>Preserved in glass — lasts 2 years</div>
              </div>

              <div className="float-card-2" style={{position:"absolute", bottom:22, left:-10, background:"#FFD6D9", border:"1px solid #2B1A12", borderRadius:20, padding:14, width:170, boxShadow:"0 16px 30px rgba(0,0,0,0.12)"}}>
                <div style={{fontSize:28}}>💌</div>
                <div style={{fontFamily:"Cormorant Garamond", fontStyle:"italic", fontSize:15, lineHeight:1.2}}>“She cried. Perfect.”</div>
                <div style={{fontSize:11, opacity:0.6, marginTop:4}}>— Aarav, delivered today</div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="marquee" style={{marginTop:24, background:"#FFD6D9"}}>
          <div className="marquee-track">
            {Array.from({length:8}).map((_,i)=>(
              <span key={i}>✦ FREE DELIVERY OVER ₹1999 ✦ HANDWRITTEN CARD ✦ 5AM FRESH MARKET ✦ ZERO PLASTIC ✦</span>
            ))}
            {Array.from({length:8}).map((_,i)=>(
              <span key={"b"+i}>✦ FREE DELIVERY OVER ₹1999 ✦ HANDWRITTEN CARD ✦ 5AM FRESH MARKET ✦ ZERO PLASTIC ✦</span>
            ))}
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section id="shop" style={{padding:"48px 0 20px"}}>
        <div className="container">
          <div style={{display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"end", gap:16, marginBottom:22}} className="reveal-up">
            <div>
              <div style={{fontSize:11, letterSpacing:"0.2em", fontWeight:800, opacity:0.5}}>BESTSELLERS — SPRING 2026</div>
              <h2 style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(32px, 5vw, 48px)", fontWeight:400, lineHeight:0.95, marginTop:6}}>Bouquets people <i style={{fontFamily:"Instrument Serif", fontWeight:400, color:"#E76F51"}}>fall for</i></h2>
            </div>
            <div style={{display:"flex", gap:10, alignItems:"center"}}>
              <span style={{fontSize:13, fontWeight:600, opacity:0.6}}>Scroll →</span>
              <div style={{width:80, height:2, background:"#2B1A12"}}/>
            </div>
          </div>

          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:16, marginTop:10}} className="reveal-stagger">
            {products.map((p)=>(
              <motion.div key={p.id} whileHover={{y:-8}} transition={{type:"spring", stiffness:300, damping:20}}
                style={{background:"#fff", borderRadius:24, overflow:"hidden", border:"1px solid #EDE6DA", display:"flex", flexDirection:"column"}}>
                <div style={{position:"relative", height:280, overflow:"hidden", background:p.color}}>
                  <img src={p.img} alt={p.name} style={{width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.6s"}} className="prod-img"/>
                  <div style={{position:"absolute", top:12, left:12, background:"#2B1A12", color:"#fff", fontSize:10, fontWeight:800, letterSpacing:"0.12em", padding:"6px 10px", borderRadius:999}}>{p.tag}</div>
                  <button onClick={()=>addToCart(p.name)} style={{position:"absolute", bottom:12, right:12, width:44, height:44, borderRadius:"50%", background:"#fff", border:"1px solid #2B1A12", display:"grid", placeItems:"center", cursor:"pointer", boxShadow:"0 8px 18px rgba(0,0,0,0.12)"}}>＋</button>
                </div>
                <div style={{padding:16}}>
                  <div style={{fontFamily:"Cormorant Garamond", fontSize:18, fontWeight:600}}>{p.name}</div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6}}>
                    <span style={{fontWeight:800, fontSize:14}}>{p.price}</span>
                    <span style={{fontSize:12, opacity:0.5}}>350g • 18 stems</span>
                  </div>
                  <div style={{display:"flex", gap:6, marginTop:10}}>
                    <span style={{width:14, height:14, borderRadius:"50%", background:"#FFD6D9", border:"1px solid #ddd"}}/>
                    <span style={{width:14, height:14, borderRadius:"50%", background:"#606C38", border:"1px solid #ddd"}}/>
                    <span style={{width:14, height:14, borderRadius:"50%", background:"#FFE7A0", border:"1px solid #ddd"}}/>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{display:"flex", justifyContent:"center", marginTop:18}}>
            <button onClick={()=>addToCart("Full Collection")} style={{background:"#fff", border:"1px solid #2B1A12", borderRadius:999, padding:"12px 22px", fontWeight:700, fontSize:13, letterSpacing:"0.08em", cursor:"pointer"}}>VIEW FULL COLLECTION (42)</button>
          </div>
        </div>
      </section>

      {/* OCCASIONS */}
      <section id="occasions" style={{padding:"28px 0"}}>
        <div className="container">
          <div style={{background:"#2B1A12", color:"#FFFBF0", borderRadius:28, padding:"22px 16px", display:"grid", gridTemplateColumns:"1fr", gap:14}} className="reveal-up">
            <div style={{display:"flex", flexWrap:"wrap", gap:10, justifyContent:"space-between", alignItems:"center"}}>
              <h3 style={{fontFamily:"Cormorant Garamond", fontSize:28, fontWeight:400}}>Pick an <i style={{fontFamily:"Instrument Serif", color:"#FFD6D9"}}>occasion</i>, we'll handle the poetry.</h3>
              <span style={{fontSize:11, letterSpacing:"0.16em", opacity:0.6}}>TAP TO EXPLORE →</span>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10}}>
              {[
                {title:"Birthdays", img:"https://images.unsplash.com/photo-1510079598890-6d80f65f5ba0?w=500&q=80", count:"24 bouquets"},
                {title:"Anniversaries", img:"https://images.unsplash.com/photo-1524386416438-a8aee5376424?w=500&q=80", count:"18 bouquets"},
                {title:"Apologies", img:"https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=500&q=80", count:"12 bouquets"},
                {title:"Just Because", img:"https://images.unsplash.com/photo-1490772888775-55fceea286b8?w=500&q=80", count:"30 bouquets"},
              ].map((o)=>(
                <div key={o.title} onClick={()=>addToCart(o.title)} style={{position:"relative", height:160, borderRadius:20, overflow:"hidden", cursor:"pointer", border:"1px solid rgba(255,255,255,0.12)"}}>
                  <img src={o.img} style={{width:"100%", height:"100%", objectFit:"cover", opacity:0.9}} alt={o.title}/>
                  <div style={{position:"absolute", inset:0, background:"linear-gradient(180deg, transparent, rgba(0,0,0,0.55))"}}/>
                  <div style={{position:"absolute", bottom:12, left:12}}>
                    <div style={{fontFamily:"Cormorant Garamond", fontSize:18, fontWeight:600}}>{o.title}</div>
                    <div style={{fontSize:11, opacity:0.7, letterSpacing:"0.12em"}}>{o.count}</div>
                  </div>
                  <div style={{position:"absolute", top:10, right:10, width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.92)", color:"#2B1A12", display:"grid", placeItems:"center", fontWeight:800}}>→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about-section" style={{padding:"36px 0"}}>
        <div className="container" style={{display:"grid", gridTemplateColumns:"1fr", gap:24, alignItems:"center"}}>
          <div className="about-img" style={{position:"relative", borderRadius:28, overflow:"hidden", height:460, border:"1px solid #2B1A12"}}>
            <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80" alt="atelier" style={{width:"100%", height:"100%", objectFit:"cover"}}/>
            <div className="bouquet-rot" style={{position:"absolute", bottom:16, left:16, background:"#FFFBF0", borderRadius:16, padding:12, width:200, border:"1px solid #2B1A12"}}>
              <div style={{fontSize:11, fontWeight:800, letterSpacing:"0.12em"}}>✦ MEET THE FLORIST</div>
              <div style={{fontFamily:"Cormorant Garamond", fontSize:16, marginTop:4, lineHeight:1.2}}>"Every stem is chosen like a word in a poem."</div>
              <div style={{fontSize:11, opacity:0.6, marginTop:4}}>— Naina, Lead Florist</div>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, letterSpacing:"0.2em", fontWeight:800, opacity:0.5}}>OUR STORY • 12 YEARS</div>
            <h2 style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(30px, 4.5vw, 42px)", lineHeight:0.95, marginTop:8, fontWeight:400}}>A little shop on <i style={{fontFamily:"Instrument Serif", color:"#E76F51"}}>Shahpur Jat</i> that became Delhi's love language.</h2>
            <p style={{marginTop:12, color:"#6B4A3A", lineHeight:1.7, fontSize:15}}>We started with a single cooler and a bicycle. Today, our atelier wakes at 4:30am to pick from Ghazipur mandi — roses still cold, jasmine still closed. Each bouquet is tied, not arranged. That means movement, air, and imperfection.</p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:18}}>
              {[
                {n:"50k+", l:"bouquets/year"},
                {n:"98%", l:"on-time"},
                {n:"4.9★", l:"Google rating"},
              ].map(s=>(
                <div key={s.n} style={{background:"#fff", border:"1px solid #EDE6DA", borderRadius:16, padding:14, textAlign:"center"}}>
                  <div style={{fontFamily:"Cormorant Garamond", fontSize:22, fontWeight:700}}>{s.n}</div>
                  <div style={{fontSize:11, letterSpacing:"0.08em", opacity:0.6}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex", gap:10, marginTop:16}}>
              <button onClick={()=>addToCart("Workshop Ticket")} style={{background:"#2B1A12", color:"#fff", border:"none", borderRadius:999, padding:"12px 20px", fontWeight:700, fontSize:13, cursor:"pointer"}}>JOIN WEEKEND WORKSHOP</button>
              <button style={{background:"#fff", border:"1px solid #2B1A12", borderRadius:999, padding:"12px 20px", fontWeight:700, fontSize:13}}>VISIT ATELIER</button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:"22px 0"}}>
        <div className="container">
          <div style={{background:"#FFE9E3", borderRadius:28, padding:"24px 18px", border:"1px solid #2B1A12", position:"relative", overflow:"hidden"}} className="reveal-up">
            <div style={{position:"absolute", fontSize:120, opacity:0.06, top:-10, right:20, fontFamily:"Cormorant Garamond"}}>“</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr", gap:16}}>
              <div style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(22px, 3.5vw, 32px)", lineHeight:1.15}}>
                “Ordered at 2pm for my mom's 60th. Came at 5pm, <span style={{background:"#fff", padding:"0 6px", borderRadius:6}}>handwritten note, extra peonies</span>. She cried. I cried. 10/10.”
              </div>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <img src="https://i.pravatar.cc/100?img=33" style={{width:44, height:44, borderRadius:"50%"}} alt=""/>
                <div>
                  <div style={{fontWeight:800, fontSize:14}}>Sarah & Mom — Lajpat Nagar</div>
                  <div style={{fontSize:12, opacity:0.6}}>Verified purchase • Eternal Blush • Today</div>
                </div>
                <div style={{marginLeft:"auto", display:"flex", gap:2, color:"#E76F51"}}>★★★★★</div>
              </div>
            </div>
            <div style={{display:"flex", gap:8, marginTop:16, overflowX:"auto"}}>
              {[
                "“Best in Delhi, period.” — Kabir",
                "“Packaging is art.” — Meera",
                "“My go-to for apologies.” — Rohan",
              ].map(t=>(
                <div key={t} style={{background:"#fff", border:"1px solid #2B1A12", borderRadius:999, padding:"8px 14px", fontSize:12, fontWeight:600, whiteSpace:"nowrap"}}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY / CTA */}
      <section style={{padding:"28px 0 40px"}}>
        <div className="container">
          <div style={{display:"grid", gridTemplateColumns:"1fr", gap:16}}>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, height:140}}>
              {[
                "https://images.unsplash.com/photo-1563241527-3004b7be0ee9?w=400&q=80",
                "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80",
                "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80",
                "https://images.unsplash.com/photo-1487070183336-baaa0eb325dd?w=400&q=80",
              ].map((src,i)=>(
                <div key={i} style={{borderRadius:16, overflow:"hidden", border:"1px solid #EDE6DA"}}>
                  <img src={src} style={{width:"100%", height:"100%", objectFit:"cover"}} alt=""/>
                </div>
              ))}
            </div>

            <div style={{background:"#2B1A12", color:"#FFFBF0", borderRadius:28, padding:24, display:"grid", gap:16, textAlign:"center", position:"relative", overflow:"hidden"}}>
              <div style={{position:"absolute", width:400, height:400, background:"radial-gradient(circle, #E76F51 0%, transparent 70%)", opacity:0.2, left:-80, top:-80, borderRadius:"50%"}}/>
              <div style={{fontFamily:"Cormorant Garamond", fontSize:"clamp(28px, 4vw, 44px)", lineHeight:0.95}}>Send flowers <i style={{fontFamily:"Instrument Serif", color:"#FFD6D9"}}>today</i>.</div>
              <p style={{opacity:0.7, maxWidth:560, margin:"0 auto"}}>Order before 4pm for same-day delivery in Delhi & Mumbai. Free handwritten card with every bouquet. We’ll write exactly what you feel — beautifully.</p>
              <div style={{display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap"}}>
                <input placeholder="Your email for 15% off" style={{background:"#fff", border:"none", borderRadius:999, padding:"14px 18px", minWidth:260, fontSize:14, outline:"none"}}/>
                <button onClick={()=>addToCart("Email Subscription")} style={{background:"#FFD6D9", color:"#2B1A12", border:"none", borderRadius:999, padding:"14px 22px", fontWeight:800, cursor:"pointer"}}>GET CODE →</button>
              </div>
              <div style={{fontSize:11, letterSpacing:"0.12em", opacity:0.5}}>✦ JOIN 18,000+ WHO GET FRIDAY FLOWER NOTES</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:"#FFF1E6", borderTop:"1px solid #2B1A12", padding:"30px 0 20px"}}>
        <div className="container">
          <div style={{display:"grid", gridTemplateColumns:"1fr", gap:18}}>
            <div style={{display:"flex", flexWrap:"wrap", gap:24, justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex", alignItems:"center", gap:10}}>
                  <div style={{width:36,height:36, background:"#2B1A12", borderRadius:"50%", display:"grid", placeItems:"center", color:"#FFD6D9", fontFamily:"Instrument Serif", fontStyle:"italic"}}>p</div>
                  <span style={{fontFamily:"Cormorant Garamond", fontWeight:700, letterSpacing:"0.14em"}}>PÉTAL & BLOOM</span>
                </div>
                <div style={{fontSize:13, color:"#6B4A3A", marginTop:8, maxWidth:320, lineHeight:1.6}}>Atelier: 12 Shahpur Jat, Delhi 110049 • Open 8am–8pm daily. Wholesale & weddings: hello@petalbloom.in</div>
                <div style={{display:"flex", gap:8, marginTop:12}}>
                  {["IG","PIN","WA"].map(s=>(
                    <div key={s} style={{width:32,height:32, borderRadius:"50%", background:"#fff", border:"1px solid #2B1A12", display:"grid", placeItems:"center", fontSize:11, fontWeight:800}}>{s}</div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex", gap:28, fontSize:13, lineHeight:2}}>
                <div><div style={{fontWeight:800, letterSpacing:"0.12em", fontSize:11}}>SHOP</div><div>All Bouquets<br/>Subscription<br/>Dried Flowers<br/>Gift Cards</div></div>
                <div><div style={{fontWeight:800, letterSpacing:"0.12em", fontSize:11}}>HELP</div><div>Delivery<br/>Care Tips<br/>Returns<br/>Contact</div></div>
                <div><div style={{fontWeight:800, letterSpacing:"0.12em", fontSize:11}}>ATELIER</div><div>Our Story<br/>Careers<br/>Press<br/>Wholesale</div></div>
              </div>
            </div>
            <div style={{borderTop:"1px solid #EDE6DA", paddingTop:12, display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:10, fontSize:11, letterSpacing:"0.1em", opacity:0.6}}>
              <span>© 2026 PÉTAL & BLOOM • MADE WITH 🌸 IN DELHI</span>
              <span>PRIVACY • TERMS • SHIPPING</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .hide-mobile-nav { display:none !important; }
        .mobile-only { display:grid !important; }
        @media(min-width:900px){
          .hide-mobile-nav{ display:flex !important; }
          .mobile-only{ display:none !important; }
          .hide-mobile{ display:inline !important; }
          .hero-grid{ grid-template-columns: 1.05fr 0.95fr !important; align-items:center; gap:24px !important; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        a:hover{ opacity:0.7 }
      `}</style>
    </div>
  )
}

function Loader(){
  return (
    <motion.div initial={{opacity:1}} exit={{opacity:0, transition:{duration:0.6}}} style={{position:"fixed", inset:0, zIndex:100, background:"#FFFBF0", display:"grid", placeItems:"center"}}>
      <div style={{textAlign:"center"}}>
        <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1, transition:{duration:0.8, ease:"easeOut"}}} style={{width:84, height:84, margin:"0 auto", borderRadius:"50%", background:"#2B1A12", display:"grid", placeItems:"center", position:"relative"}}>
          <span style={{fontFamily:"Instrument Serif", fontStyle:"italic", fontSize:36, color:"#FFD6D9"}}>p</span>
          <motion.div animate={{rotate:360}} transition={{duration:3, repeat:Infinity, ease:"linear"}} style={{position:"absolute", inset:-8, border:"1px dashed #E76F51", borderRadius:"50%", opacity:0.4}}/>
        </motion.div>
        <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1, transition:{delay:0.4}}} style={{marginTop:16}}>
          <div style={{fontFamily:"Cormorant Garamond", fontSize:20, letterSpacing:"0.22em", fontWeight:700}}>PÉTAL & BLOOM</div>
          <div style={{fontSize:11, letterSpacing:"0.2em", opacity:0.5, marginTop:4}}>ARRANGING YOUR BOUQUET...</div>
        </motion.div>
        <div style={{width:120, height:2, background:"#EDE6DA", borderRadius:999, margin:"18px auto 0", overflow:"hidden"}}>
          <motion.div initial={{x:"-100%"}} animate={{x:"0%"}} transition={{duration:1.7, ease:"easeInOut"}} style={{width:"100%", height:"100%", background:"#E76F51"}}/>
        </div>
      </div>
    </motion.div>
  )
}
