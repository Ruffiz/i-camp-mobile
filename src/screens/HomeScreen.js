import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  Button,
  KeyboardAvoidingView,
  StatusBar,
  Keyboard,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Svg, { Image, Ellipse, ClipPath } from "react-native-svg";
import MapView, {
  LatLng,
  Marker,
  Callout,
  Circle,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import {
  GooglePlacesAutocomplete,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";
import config from "../../config";
import Constants from "expo-constants";

export default function HomeScreen() {
  const { height, width } = Dimensions.get("window");
  const imagePosition = useSharedValue(1);
  const [isSearchCamp, setIsSearchCamp] = useState(false);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(
      imagePosition.value,
      [0, 1],
      [-height / 1.02, 0]
    );
    return {
      transform: [
        { translateY: withTiming(interpolation, { duration: 1500 }) },
      ],
    };
  });

  const searchImageAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(
      imagePosition.value,
      [0, 1],
      [-height / 1.02, 0]
    );
    return {
      transform: [
        { translateY: withTiming(interpolation, { duration: 1500 }) },
      ],
    };
  });

  const buttonsAnimatedStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [300, 0]);
    return {
      opacity: withTiming(imagePosition.value, { duration: 1500 }),
      width: "100%",
      transform: [
        { translateY: withTiming(interpolation, { duration: 1500 }) },
      ],
    };
  });

  const closeButtonContainerStyle = useAnimatedStyle(() => {
    const interpolation = interpolate(imagePosition.value, [0, 1], [360, 180]);
    return {
      opacity: withTiming(imagePosition.value === 1 ? 0 : 1, { duration: 800 }),
      transform: [
        { rotate: withTiming(interpolation + "deg", { duration: 1000 }) },
      ],
    };
  });

  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        imagePosition.value === 0
          ? withDelay(300, withTiming(1, { duration: 1500 }))
          : withTiming(0, { duration: 1500 }),
    };
  });

  const checkLocationButtonHandler = () => {
    imagePosition.value = 0;
    if (isSearchCamp) {
      setIsSearchCamp(false);
    }
  };
  const searchCampButtonHandler = () => {
    imagePosition.value = 0;
    if (!isSearchCamp) {
      setIsSearchCamp(true);
    }
  };

  const [position, setPosition] = useState({
    latitude: 59.052407,
    longitude: 10.027912,
    latitudeDelta: 0.005,
    longitudeDelta: 0.0005,
  });
  const [region, setRegion] = useState({
    latitude: 59.052407,
    longitude: 10.027912,
    latitudeDelta: 0.045,
    longitudeDelta: 0.045,
  });

  const mapRef = useRef(null);

  type InputAutocompleteProps = {
    onPlaceSelected: (details: GooglePlaceDetail | null) => void,
  };

  const InputAuto = ({ onPlaceSelected }: InputAutocompleteProps) => {
    return (
      <GooglePlacesAutocomplete
        styles={{ textInput: styles.searchInput }}
        placeholder="Search"
        fetchDetails={true}
        onPress={(data, details = null) => {
          onPlaceSelected(details);
        }}
        query={{
          key: config.API_KEY,
          language: "no",
        }}
      />
    );
  };

  const animateCamera = async (pos: LatLng) => {
    const camera = await mapRef.current?.getCamera();
    if (camera) {
      camera.center = pos;
      mapRef.current?.animateCamera(camera, { duration: 1000 });
    }
  };

  const [origin, setOrigin] = useState(LatLng | null);
  const onPlaceSelected = (details: GooglePlaceDetail | null) => {
    const pos = {
      latitude: details?.geometry.location.lat || 0,
      longitude: details?.geometry.location.lng || 0,
    };
    setOrigin(pos);
    animateCamera(pos);
  };

  // W.I.P. - Fix tracking distance on map..

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.045,
        longitudeDelta: 0.045,
      });
      // setRegion({ latitude: });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          !isSearchCamp ? imageAnimatedStyle : searchImageAnimatedStyle,
          imagePosition === 1 ? Keyboard.dismiss : null,
        ]}
      >
        <Svg height={height + 20} width={width}>
          <ClipPath id="clipPathId">
            <Ellipse cx={width / 2} rx={height + 200} ry={height + 20} />
          </ClipPath>
          <Image
            href={require("../../assets/images/night_camping2.jpg")}
            width={width + 80}
            height={height + 80}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#clipPathId)"
          />
        </Svg>
        <Animated.View
          style={[styles.closeButtonContainer, closeButtonContainerStyle]}
        >
          <Text
            style={styles.closeButtonText}
            onPress={() => ((imagePosition.value = 1), Keyboard.dismiss())}
          >
            V
          </Text>
        </Animated.View>
      </Animated.View>
      <View
        style={styles.searchBottomContainer}
        // style={
        //  !isSearchCamp ? styles.bottomContainer : styles.searchBottomContainer
        // }
      >
        <Animated.View style={buttonsAnimatedStyle}>
          <Pressable
            style={styles.searchButton}
            onPress={searchCampButtonHandler}
          >
            <Text style={styles.searchButtonText}>Search for camps</Text>
          </Pressable>
        </Animated.View>
        <Animated.View style={buttonsAnimatedStyle}>
          <Pressable
            style={styles.searchButton}
            onPress={checkLocationButtonHandler}
          >
            <Text style={styles.searchButtonText}>Check spots near you</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
          {/* <View>
            <TextInput
              style={{ zIndex: 2, color: "white", borderColor: "white" }}
            >
              Search
            </TextInput>
          </View> */}
          {isSearchCamp && (
            <>
              <MapView
                ref={mapRef}
                style={styles.searchMap}
                provider={PROVIDER_GOOGLE}
                region={position}
                zoomEnabled={true}
                type="&keyword=campground"
                // onMarkerPress
              >
                {/* <Marker
                  coordinate={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                  }}
                /> */}
              </MapView>
              <View style={styles.searchContainer}>
                <InputAuto onPlaceSelected={onPlaceSelected} />
              </View>
            </>
          )}
          {!isSearchCamp && (
            <MapView
              style={styles.searchMap}
              provider={PROVIDER_GOOGLE}
              region={position}
              // showsUserLocation={true}
            >
              <Marker
                coordinate={position}
                // pinColor="gold"
                tracksViewChanges={false}
                // draggable={true}
                // onDragStart={(e) => {
                //   console.log("Drag start", e.nativeEvent.coordinate);
                // }}
                // onDragEnd={(e) => {
                //   console.log("Drag end", e.nativeEvent.coordinate);

                //   setPosition({
                //     latitude: e.nativeEvent.coordinate.latitude,
                //     longitude: e.nativeEvent.coordinate.longitude,
                //     latitudeDelta: 0.004,
                //     longitudeDelta: 0.009,
                //   });
                // }}
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>You</Text>
                </View>
              </Marker>
            </MapView>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  searchButton: {
    backgroundColor: "#550080",
    width: "75%",
    height: 55,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 35,
    marginHorizontal: 30,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "white",
    zIndex: 0.5,
  },
  searchButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    letterSpacing: 0.5,
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  closeButtonContainer: {
    height: 35,
    width: 35,
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 12,
    backgroundColor: "#550080",
    alignItems: "center",
    borderRadius: 20,
    top: -20,
  },
  closeButtonText: {
    fontSize: 20,
    color: "white",
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: height / 1.5,
  },
  searchBottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: height / 1.03,
  },
  mapContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: -1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchMap: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    position: "absolute",
    width: "90%",
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    padding: 8,
    borderRadius: 8,
    // top: 40,
    top: Constants.statusBarHeight + 30,
  },
  searchInput: {
    borderColor: "#888",
    borderWidth: 1,
  },
  marker: {
    backgroundColor: "#550080",
    padding: 5,
    borderRadius: 5,
  },
  // marker: {
  //   width: 0,
  //   height: 0,
  //   backgroundColor: "transparent",
  //   borderStyle: "solid",
  //   borderTopWidth: 0,
  //   borderRightWidth: 45,
  //   borderBottomWidth: 90,
  //   borderLeftWidth: 45,
  //   borderTopColor: "transparent",
  //   borderRightColor: "transparent",
  //   borderBottomColor: "##550080",
  //   borderLeftColor: "transparent",
  // },
  markerText: {
    color: "white",
    fontWeight: "bold",
  },
});
