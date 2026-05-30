import { useEffect, useRef, useState } from 'react'

export default function MapPanel({ geoResults }) {
  const mapRef  = useRef(null)
  const viewRef = useRef(null)
  const [status, setStatus] = useState('Chargement...')

  // ── Init carte
  useEffect(() => {
    const initMap = async () => {
      try {
        const { default: WebMap }  = await import('@arcgis/core/WebMap')
        const { default: MapView } = await import('@arcgis/core/views/MapView')

        const webmap = new WebMap({
          portalItem: { id: "9fbda5cdde994a83a0c11b4280cf8942" }
        })

        const view = new MapView({
          container: mapRef.current,
          map: webmap
        })

        await view.when()
        viewRef.current = view
        setStatus('Prêt')
      } catch (err) {
        setStatus('Erreur chargement')
        console.error(err)
      }
    }
    initMap()
  }, [])

  // ── Afficher / effacer les résultats
  useEffect(() => {
    if (!viewRef.current) return

    // ── geoResults null → effacer les points + reset zoom
    if (!geoResults) {
      const oldLayer = viewRef.current.map.layers
        .find(l => l.id === "chat-results")
      if (oldLayer)
        viewRef.current.map.remove(oldLayer)

      viewRef.current.goTo({
        center: [9.5375, 33.8869],
        zoom: 6
      })
      setStatus('Prêt')
      return
    }

    // ── geoResults présent → afficher les points
    const showGeoResults = async () => {
      try {
        const { default: GraphicsLayer } =
          await import('@arcgis/core/layers/GraphicsLayer')
        const { default: Graphic } =
          await import('@arcgis/core/Graphic')

        // Supprimer ancienne couche
        const oldLayer = viewRef.current.map.layers
          .find(l => l.id === "chat-results")
        if (oldLayer)
          viewRef.current.map.remove(oldLayer)

        // Nouvelle couche
        const layer = new GraphicsLayer({ id: 'chat-results' })

        geoResults.features.forEach(feature => {
          const [lon, lat] = feature.geometry.coordinates
          const props      = feature.properties

          const graphic = new Graphic({
            geometry: { type: 'point', longitude: lon, latitude: lat },
            symbol: {
              type:    'simple-marker',
              color:   [212, 160, 23],
              size:    12,
              outline: { color: 'white', width: 2 }
            },
            attributes: props,
            popupTemplate: {
              title:   props.name,
              content: `
                <b>Type :</b> ${props.type}<br/>
                <b>Région :</b> ${props.region}<br/>
                <b>Téléphone :</b> ${props.phone || 'N/A'}<br/>
                <b>Site :</b>
                <a href="${props.website}" target="_blank">Visiter</a>
              `
            }
          })
          layer.add(graphic)
        })

        viewRef.current.map.add(layer)

        // Zoom sur les résultats
        if (geoResults.features.length > 0) {
          const [lon, lat] = geoResults.features[0].geometry.coordinates
          viewRef.current.goTo({ center: [lon, lat], zoom: 10 })
        }

        setStatus(`${geoResults.features.length} résultat(s)`)
      } catch (err) {
        console.error(err)
      }
    }

    showGeoResults()
  }, [geoResults])

  return (
    <div className="map-panel">
      <div className="map-container" ref={mapRef} />
      <div className="map-status">📍 {status}</div>
    </div>
  )
}