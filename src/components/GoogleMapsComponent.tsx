import React, { useCallback, useRef, useState } from "react";
import { GoogleMap, MarkerF, useJsApiLoader, InfoWindow } from '@react-google-maps/api'


function GoogleMapsComponent() {


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCo9BCxhisif_MQcZAhpJogVIO24UGav0M',
      })

      const [map, setMap] = useState<google.maps.Map | null>(null)
      const [selectedMarker, setSelectedMarker] = useState<{
        position: { lat: number, lng: number },
        title: string,
        content: string,
        label: string
      } | null>(null)

      // Marker data
      const markerData = [
        {
          id: 1,
          position: { lat: 40.413089917539246, lng: 49.89617637790905 },
          title: "Dövlət Vergi Xidmətinin aparatı",
          content: "Dövlət Vergi Xidmətinin aparatı",
          label: "DVX"
        },
        {
          id: 2,
          position: { lat: 40.41216021574748, lng: 49.89531639327501},
          title: "Dövlət Vergi Xidmətinin Milli Gəlirlər Baş İdarəsi",
          content: "Dövlət Vergi Xidmətinin Milli Gəlirlər Baş İdarəsi",
          label: "MGBİ"
        }
      ]

      // Handle marker click
      const handleMarkerClick = useCallback((markerInfo: {
        id: number,
        position: { lat: number, lng: number },
        title: string,
        content: string,
        label: string
      }) => {

        setSelectedMarker(markerInfo)

      }, [])

      // Handle info window close
      const handleInfoWindowClose = useCallback(() => {
        setSelectedMarker(null)
      }, [])

      //onloading methods
      const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map)
      }, [])

      const onUnmount = useCallback(() => {
        setMap(null)
      }, [])

      // Map options to hide default markers
      const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        styles: [
        //   {
        //     featureType: "poi",
        //     elementType: "labels",
        //     stylers: [{ visibility: "off" }]
        //   },
        //   {
        //     featureType: "transit",
        //     elementType: "labels",
        //     stylers: [{ visibility: "off" }]
        //   },
          {
            featureType: "business",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      }

    


    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 40.4028461, lng: 49.8472913 }}
            zoom={13}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
        >
            {markerData.map((marker) => (
              <MarkerF
                key={marker.id}
                title={marker.title}
                label={{
                    text: marker.label,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '11px',
                }}
                position={marker.position}

                onClick={() => handleMarkerClick(marker)}
                animation={google.maps.Animation.DROP}
              />
            ))}

            {selectedMarker && (
                <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={handleInfoWindowClose}
                >
                    <div>
                        <h3>{selectedMarker.title}</h3>
                        <p>{selectedMarker.content}</p>
                    </div>
                </InfoWindow>
            )}

        </GoogleMap>
    ) : <>XERITE YUKLENMEDI</>
}

export default React.memo(GoogleMapsComponent);
