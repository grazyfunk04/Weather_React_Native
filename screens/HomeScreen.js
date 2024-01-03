import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { theme } from "../theme";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "../utils/asyncStorage";

const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [back, setBack] = useState(false);

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
      // console.data('got forecast: ', data);
    })
  };

  const handleSearch = value => {
    // fetch
    if(value.length>2){
      fetchLocations({cityName: value}).then(data=>{
        setLocations(data);
      })
    }
  };
  
  useEffect(()=>{
    fetchMyWeatherData();
  }, []); 

  const fetchMyWeatherData = async () =>{
    let myCity = await getData('city');
    let cityName = 'Rewari';
    if(myCity) cityName = myCity; 
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
    })
  }
  const handleTextDebounce = useCallback(debounce(handleSearch, 2200), []);

  const {current, location} = weather;
  return (
    <View style={tw`flex-1 relative`}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        style={tw`absolute h-full w-full`}
      />
      {
        loading ? (
          <View className="flex-1 flex-row justify-center items-center">
              <Progress.CircleSnail thickness={10} size={140} color={'#0bb3b2'} />
            </View>
        ) : (
            <SafeAreaView style={tw`flex flex-1`}>
              <View style={{ height: "7%" }} className="mx-4 relative z-50">
                <View
                  className="flex-row justify-end items-center rounded-full mt-3"
                  style={{
                    backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent",
                  }}
                >
                  {showSearch ? (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder="Search City"
                      placeholderTextColor={"lightgray"}
                      className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                    />
                  ) : null}
                  <TouchableOpacity
                    onPress={() => toggleSearch(!showSearch)}
                    style={{ backgroundColor: theme.bgWhite(0.3) }}
                    className="rounded-full p-3 m-1 mr-1"
                  >
                    <MagnifyingGlassIcon size={20} color={"white"} />
                  </TouchableOpacity>
                </View>
                {locations.length > 0 && showSearch ? (
                  <View className="w-full bg-gray-300 top-16 rounded-3xl mt-2 absolute">
                    {locations.map((loc, index) => {
                      let showBorder = index + 1 != locations.length;
                      let borderClass = showBorder
                        ? "border-b-2 border-b-gray-400"
                        : ";";
                      return (
                        <TouchableOpacity
                          onPress={() => handleLocation(loc)}
                          key={index}
                          className={
                            "flex-row items-center border-0 p-3 px-4 mb-1 " +
                            borderClass
                          }
                        >
                          <MapPinIcon size={20} color={"gray"} />
                          <Text className="text-black ml-2 text-xl">
                            {loc?.name}, {loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
              {
                showSearch ? null : (
                  <>
                    <View className="mx-4 flex justify-evenly flex-1 mb-2">
                      {/* location  */}
                      <Text className="text-white text-center text-2xl font-bold">
                        {location?.name},
                        <Text className="text-lg font-semibold text-gray-300">
                          {" " + location?.country}
                        </Text>
                      </Text>

                      {/* weather image */}
                      <View className="flex-row justify-center">
                        <Image
                          // source={{uri: "https:"+current?.condition?.icon}}
                          source={weatherImages[current?.condition?.text]}
                          className="w-52 h-52"
                        />
                      </View>

                      {/* degree calcius */}
                      <View className="space-y-2">
                        <Text className="text-center font-bold text-white text-6xl ml-5">
                          {current?.temp_c}&#176;
                        </Text>
                        <Text className="text-center  text-white text-xl tracking-widest">
                          {current?.condition?.text}
                        </Text>
                      </View>

                      {/* other stats */}
                      <View className="flex-row justify-between mx-4">
                        <View className="flex-row space-x-2 items-center">
                          <Image
                            source={require("../assets/icons/wind.png")}
                            className="h-6 w-6"
                          />
                          <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                        </View>
                        <View className="flex-row space-x-2 items-center">
                          <Image
                            source={require("../assets/icons/drop.png")}
                            className="h-6 w-6"
                          />
                          <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                        </View>
                        <View className="flex-row space-x-2 items-center">
                          <Image
                            source={require("../assets/icons/sun.png")}
                            className="h-6 w-6"
                          />
                          <Text className="text-white font-semibold text-base">
                            {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="mb-2 space-y-3">
                      <View className="flex-row items-center mx-5 space-x-2">
                        <CalendarDaysIcon size={22} color={"white"} />
                        <Text className="text-white text-base">Daily forecast</Text>
                      </View>
                      <ScrollView
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                        showsHorizontalScrollIndicator={false}
                      >
                        {
                          weather?.forecast?.forecastday?.map((item, index)=>{
                            let day = new Date(item?.date);
                            let options = {weekday: 'long'};
                            let dayName = day.toLocaleDateString('en-US', options);
                            dayName = dayName.split(',')[0];
                            return (
                              <View
                                className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                style={{ backgroundColor: theme.bgWhite(0.15) }}
                              >
                                <Image
                                  source={weatherImages[item?.day?.condition?.text]}
                                  className="h-11 w-11"
                                />
                                <Text className="text-white">{dayName}</Text>
                                <Text className="text-white font-semibold text-xl">{item?.day?.avgtemp_c}&#176;</Text>
                              </View>   
                            )
                          })
                        } 
                      </ScrollView>
                    </View>
                  </>
                )
              }

              {/* forecast for next days */}
            </SafeAreaView>
        )
      }
    </View>
  );
};

export default HomeScreen;
