export const geocodeAddress = (addressItem, variable = 'placeId') => {
    return new Promise((resolve) => {
      if (window.google) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ [variable]: addressItem[variable] }, (response, status) => {
          if (status === window.google.maps.GeocoderStatus.OK) {
            const address = response[0] // some address returns more than 1 response
            resolve({
              ...addressItem,
              raw: address,
              x: address.geometry.location.lng(),
              y: address.geometry.location.lat()
            })
          } else {
            resolve({})
          }
        });
      } else {
        resolve({})
      }
    })
  }