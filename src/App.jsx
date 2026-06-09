import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Work from './pages/Work'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import RootsBg from './components/RootsBg'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen" style={{ background: '#0B1220' }}>
        <RootsBg />
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
