import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { CartoSQLLayer, setDefaultCredentials } from "@deck.gl/carto";
import { Button, Icon } from "semantic-ui-react";

import MapControl from "./Map/Control";
import Layers from "./Map/Layers";
import LegendControl from "./Map/Legend";

import { showTooltip, toggleSearchPanel, layersLoaded } from "./actions";

import loading from "./loading.gif";

setDefaultCredentials({
  username: "anatolysukhanov",
  apiKey: "efae24f5d54f80890dff448d2cff5b958f658e39"
});

const center = {
  lat: 49.353,
  lng: -123.005
};

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function Map(props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    // googleMapsApiKey: "AIzaSyD6L9qpPAS-M340DzgHfIkzBWvtKy7OsRw"
    googleMapsApiKey: "AIzaSyAi9fvZy7EimDlhUbmAIPWx3kI1xNgXFiE"
  });

  const [map, setMap] = React.useState(null);
  const [deckOverlay, setDeckOverlay] = React.useState(null);

  // const prevIsLoading = usePrevious(props.isLoading);
  const prevAddress = usePrevious(props.address);
  const prevParcelSize = usePrevious(props.parcelSize);
  const prevSiteCoverage = usePrevious(props.siteCoverage);
  const prevDelta = usePrevious(props.delta);
  const prevZoneType = usePrevious(props.zoneType);

  const parcelsLayer = new CartoSQLLayer({
    id: "parcels",
    data: "select the_geom_webmercator, area, coverage, delta from parcels",
    opacity: 1,
    // getFillColor: [0, 255, 255],
    getFillColor: f => {
      if (f.properties.delta === undefined) {
        return [0, 0, 0, 0];
      } else if (f.properties.delta < -1.1) {
        return [204, 245, 245];
      } else if (f.properties.delta < -0.25) {
        return [166, 198, 211];
      } else if (f.properties.delta < 0.6) {
        return [128, 151, 177];
      } else if (f.properties.delta < 1.45) {
        return [90, 104, 144];
      } else if (f.properties.delta < 2.3) {
        return [52, 57, 110];
      } else {
        return [14, 11, 77];
      }
    },
    lineWidthUnits: "pixels",
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    onHover: e =>
      props.dispatch(
        showTooltip(
          e.object
            ? {
                content: [
                  e.object.properties.delta !== undefined
                    ? "Delta:" + e.object.properties.delta
                    : "No delta",
                  "Site Coverage:" +
                    e.object.properties.coverage.toFixed(2) +
                    "%",
                  "Area: " +
                    e.object.properties.area.toFixed(0) +
                    " ft" +
                    String.fromCharCode(178)
                ],
                x: e.x,
                y: e.y
              }
            : { content: null, x: 0, y: 0 }
        )
      ),
    onViewportLoad: () => props.dispatch(layersLoaded())
  });

  const buildingsLayer = new CartoSQLLayer({
    id: "buildings",
    data: "select the_geom_webmercator, bldgtype, address from buildings",
    opacity: 1,
    getFillColor: [150, 75, 0],
    lineWidthUnits: "pixels",
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    onHover: e =>
      props.dispatch(
        showTooltip(
          e.object
            ? {
                content: [
                  ...(e.object.properties.address !== undefined
                    ? ["Address: " + e.object.properties.address]
                    : []),
                  "Type: " + e.object.properties.bldgtype
                ],
                x: e.x,
                y: e.y
              }
            : { content: null, x: 0, y: 0 }
        )
      )
  });

  const zoningLayer = new CartoSQLLayer({
    id: "zoning",
    data: "select the_geom_webmercator, class_reso, fsr from zoning",
    opacity: 1,
    getFillColor: f => {
      switch (f.properties.fsr) {
        case 0:
          return [17, 237, 48];
        case 0.35:
          return [18, 177, 35];
        case 1.3:
          return [19, 118, 22];
        default:
          return [20, 59, 10];
      }
    },
    lineWidthUnits: "pixels",
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    // onHover: e => setTooltip("zones", e),
    onHover: e =>
      props.dispatch(
        showTooltip(
          e.object
            ? {
                content: [
                  "FSR: " + e.object.properties.fsr,
                  "Zone Type: " + e.object.properties.class_reso
                ],
                x: e.x,
                y: e.y
              }
            : { content: null, x: 0, y: 0 }
        )
      )
  });

  const ocpLayer = new CartoSQLLayer({
    id: "ocp",
    data: "select the_geom_webmercator, fsr from ocp",
    opacity: 1,
    getFillColor: f => {
      switch (f.properties.fsr) {
        case 0:
          return [245, 204, 204];
        case 0.35:
          return [228, 180, 182];
        case 0.55:
          return [211, 156, 161];
        case 0.8:
          return [194, 133, 139];
        case 1:
          return [178, 109, 118];
        case 1.2:
          return [161, 85, 97];
        case 1.75:
          return [144, 62, 75];
        case 2.5:
          return [127, 38, 54];
        default:
          return [111, 15, 33];
      }
    },
    lineWidthUnits: "pixels",
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    pickable: true,
    autoHighlight: true,
    // onHover: e => setTooltip("ocp", e)
    onHover: e =>
      props.dispatch(
        showTooltip(
          e.object
            ? {
                content: ["FSR: " + e.object.properties.fsr],
                x: e.x,
                y: e.y
              }
            : { content: null, x: 0, y: 0 }
        )
      )
  });

  const onLoad = React.useCallback(function callback(map) {
    // const bounds = new window.google.maps.LatLngBounds();
    // map.fitBounds(bounds);
    setMap(map);
    setDeckOverlay(
      new GoogleMapsOverlay({
        layers: [parcelsLayer, buildingsLayer, zoningLayer, ocpLayer]
      })
    );
  }, []);

  React.useEffect(() => {
    if (deckOverlay) {
      deckOverlay.setMap(map);
    }
  }, [deckOverlay]);

  React.useEffect(() => {
    if (deckOverlay) {
      let layers = [];

      if (props.layers.includes("parcels") === true) {
        let query = [];
        if (props.address) {
          query.push(`address ILIKE '%${props.address}%'`);
        }
        if (props.parcelSize) {
          query.push(`area >= ${props.parcelSize}`);
        }
        if (props.siteCoverage) {
          query.push(`coverage < ${props.siteCoverage}`);
        }
        if (props.delta) {
          query.push(`delta >= ${props.delta}`);
        }
        if (props.zoneType) {
          query.push(`zone_type = '${props.zoneType}'`);
        }
        layers.push(
          parcelsLayer.clone({
            data:
              query.length > 0
                ? `select the_geom_webmercator, area, coverage, delta from parcels WHERE ${query.join(
                    " AND "
                  )}`
                : "select the_geom_webmercator, area, coverage, delta from parcels",
            visible: true
          })
        );
      } else {
        layers.push(parcelsLayer.clone({ visible: false }));
      }

      if (props.layers.includes("buildings") === true) {
        layers.push(buildingsLayer.clone({ visible: true }));
      } else {
        layers.push(buildingsLayer.clone({ visible: false }));
      }

      if (props.layers.includes("zoning") === true) {
        layers.push(zoningLayer.clone({ visible: true }));
      } else {
        layers.push(zoningLayer.clone({ visible: false }));
      }

      if (props.layers.includes("ocp") === true) {
        layers.push(ocpLayer.clone({ visible: true }));
      } else {
        layers.push(ocpLayer.clone({ visible: false }));
      }

      deckOverlay.setProps({
        layers
      });
    }
  }, [props.layers]);

  React.useEffect(() => {
    if (!deckOverlay) return;
    // console.log("query changed");
    if (
      (prevAddress !== props.address ||
        prevParcelSize !== props.parcelSize ||
        prevSiteCoverage !== props.siteCoverage ||
        prevDelta !== props.delta ||
        prevZoneType !== props.zoneType) &&
      (props.address !== "" ||
        props.parcelSize !== "" ||
        props.siteCoverage !== "" ||
        props.delta !== "" ||
        props.zoneType !== "")
    ) {
      let query = [];
      if (props.address) {
        query.push(`address ILIKE '%${props.address}%'`);
      }
      if (props.parcelSize) {
        query.push(`area >= ${props.parcelSize}`);
      }
      if (props.siteCoverage) {
        query.push(`coverage < ${props.siteCoverage}`);
      }
      if (props.delta) {
        query.push(`delta >= ${props.delta}`);
      }
      if (props.zoneType) {
        query.push(`zone_type = '${props.zoneType}'`);
      }
      // console.log("new search, query:", query.join(" AND "));
      deckOverlay.setProps({
        layers: [
          parcelsLayer.clone({
            data: `select the_geom_webmercator, area, coverage, delta from parcels WHERE ${query.join(
              " AND "
            )}`
          }),
          buildingsLayer.clone({
            visible: props.layers.includes("buildings") === true
          }),
          zoningLayer.clone({
            visible: props.layers.includes("zoning") === true
          }),
          ocpLayer.clone({
            visible: props.layers.includes("ocp") === true
          })
        ]
      });
    } else if (
      props.address === "" &&
      props.parcelSize === "" &&
      props.siteCoverage === "" &&
      props.delta === "" &&
      props.zoneType === ""
    ) {
      // console.log("back to default search");
      deckOverlay.setProps({
        layers: [
          parcelsLayer.clone({
            data:
              "select the_geom_webmercator, area, coverage, delta from parcels"
          }),
          buildingsLayer.clone({
            visible: props.layers.includes("buildings") === true
          }),
          zoningLayer.clone({
            visible: props.layers.includes("zoning") === true
          }),
          ocpLayer.clone({
            visible: props.layers.includes("ocp") === true
          })
        ]
      });
    }
  }, [
    props.address,
    props.parcelSize,
    props.siteCoverage,
    props.delta,
    props.zoneType
  ]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onTiltChanged = () => {
    if (!map) return;
    if (map.getTilt() === 45) {
      deckOverlay.setMap(null);
    } else {
      setTimeout(() => deckOverlay.setMap(map), 500);
    }
  };

  const openSearchPanel = () => {
    // console.log("open search clicked");
    props.dispatch(toggleSearchPanel());
  };

  console.log("Map render", props.isLoading);

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%"
        }}
        center={center}
        zoom={13}
        options={{
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM
          },
          streetViewControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM
          },
          rotateControlOptions: {
            position: window.google.maps.ControlPosition.LEFT_BOTTOM
          }
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onTiltChanged={onTiltChanged}
      >
        <MapControl position={window.google.maps.ControlPosition.RIGHT_TOP}>
          <Layers dispatch={props.dispatch} layers={props.layers} />
        </MapControl>
        <MapControl position={window.google.maps.ControlPosition.TOP_CENTER}>
          <Button
            icon
            size="mini"
            onClick={openSearchPanel}
            id="open-search-panel-btn"
          >
            <Icon name="search" />
          </Button>
        </MapControl>
        <MapControl position={window.google.maps.ControlPosition.RIGHT_BOTTOM}>
          <LegendControl
            title="DELTA"
            values={[
              { value: ">= -1.95", color: "#CCF5F5" },
              { value: ">= -1.1", color: "#A6C6D3" },
              { value: ">= -0.25", color: "#8097B1" },
              { value: ">= 0.6", color: "#5A6890" },
              { value: ">= 1.45", color: "#34396E" },
              { value: ">= 2.3", color: "#0E0B4D" }
            ]}
          />
        </MapControl>
        <MapControl position={window.google.maps.ControlPosition.RIGHT_BOTTOM}>
          <LegendControl
            title="OCP"
            values={[
              { value: "0", color: "#F5CCCC" },
              { value: "0.35", color: "#E4B4B6" },
              { value: "0.55", color: "#D39CA1" },
              { value: "0.8", color: "#C2858B" },
              { value: "1", color: "#B26D76" },
              { value: "1.2", color: "#A15561" },
              { value: "1.75", color: "#903E4B" },
              { value: "2.5", color: "#7F2636" },
              { value: "3.5", color: "#6F0F21" }
            ]}
          />
        </MapControl>
        <MapControl position={window.google.maps.ControlPosition.RIGHT_BOTTOM}>
          <LegendControl
            title="ZONES"
            values={[
              { value: "0", color: "#11ED30" },
              { value: "0.35", color: "#12B123" },
              { value: "1.3", color: "#137616" },
              { value: "2.5", color: "#143B0A" }
            ]}
          />
        </MapControl>
      </GoogleMap>
      {props.isLoading === true && (
        <div className="loading-container">
          <img src={loading} className="loading" />
        </div>
      )}
    </>
  ) : (
    <></>
  );
}

export default React.memo(Map);
