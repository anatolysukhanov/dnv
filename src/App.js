import React, { Component } from "react";
import { connect } from "react-redux";

import { Segment, Sidebar } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import "./App.css";

import Map from "./Map";
import Search from "./Map/Search";

import { toggleSearchPanel } from "./actions";

class App extends Component {
  hideSidebar = () => {
    this.props.dispatch(toggleSearchPanel());
  };

  render = () => {
    const { dispatch, app, map } = this.props;
    /*console.log(
      "App render: sidebar visible?",
      app.isSidebarVisible,
      "google maps loading?",
      map.isGoogleMapsLoading,
      "layers",
      map.layers
    );*/
    return (
      <Sidebar.Pushable as={Segment}>
        <Sidebar
          animation="overlay"
          direction="top"
          icon="labeled"
          // onHide={this.hideSidebar}
          visible={app.isSidebarVisible}
          width="thin"
        >
          <Search dispatch={dispatch} bounds={map.bounds} />
        </Sidebar>
        <Sidebar.Pusher>
          <Segment basic>
            <Map
              dispatch={dispatch}
              layers={map.layers}
              viewByBuildingType={map.buildingType}
              address={app.address}
              parcelSize={app.parcelSize}
              siteCoverage={app.siteCoverage}
              delta={app.delta}
              zoneType={app.zoneType}
              buildingType={app.buildingType}
              isGoogleMapsLoading={map.isGoogleMapsLoading}
              isSidebarVisible={app.isSidebarVisible}
              isLoading={app.isLoading}
              bounds={map.bounds}
            />
            {map.tooltip.content !== null && (
              <div
                className="tooltip"
                style={{
                  left: map.tooltip.x + "px",
                  top: map.tooltip.y + "px"
                }}
              >
                {map.tooltip.content.map((content, index) => (
                  <div key={index}>{content}</div>
                ))}
              </div>
            )}
          </Segment>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    );
  };
}

const mapStateToProps = state => ({
  app: state.app,
  map: state.map
});

export default connect(mapStateToProps)(App);
