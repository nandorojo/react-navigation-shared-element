import ViewPager, {
  ViewPagerOnPageSelectedEventData
} from "@react-native-community/viewpager";
import * as React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  NativeSyntheticEvent
} from "react-native";
import {
  SharedElement,
  SharedElementsComponentConfig
} from "react-navigation-shared-element";
import { NavigationStackProp } from "react-navigation-stack";

import { Item, items } from "../data";

type Props = {
  navigation: NavigationStackProp<any>;
};

export class ViewPagerScreen extends React.Component<Props> {
  static sharedElements: SharedElementsComponentConfig = (
    navigation,
    otherNavigation,
    showing
  ) => {
    const item = navigation.getParam("item");
    return [
      { id: `${item.id}.image` },
      { id: `${item.id}.title`, animation: "fade" },
      { id: "close", animation: "fade-in" }
    ];
  };

  render() {
    const { navigation } = this.props;
    const initialItem = navigation.getParam("item");
    const initialIndex = items.indexOf(initialItem);
    console.log("initialItem: ", initialItem, ", index: ", initialIndex);
    return (
      <ViewPager
        style={styles.container}
        initialPage={initialIndex}
        onPageSelected={this.onPageSelected}
      >
        {items.map(item => this.renderItem(item))}
      </ViewPager>
    );
  }

  private renderItem(item: Item) {
    return (
      <View key={item.id} style={styles.itemContainer}>
        <SharedElement id={`${item.id}.image`} style={StyleSheet.absoluteFill}>
          <Image style={styles.image} resizeMode="cover" source={item.image} />
        </SharedElement>
        <SharedElement id={`${item.id}.title`}>
          <Text style={styles.text}>{item.title}</Text>
        </SharedElement>
      </View>
    );
  }

  private onPageSelected = (
    e: NativeSyntheticEvent<ViewPagerOnPageSelectedEventData>
  ) => {
    const { position } = e.nativeEvent;
    const { navigation } = this.props;
    navigation.setParams({
      item: items[position]
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  itemContainer: {
    flex: 1,
    alignItems: "center"
  },
  header: {
    position: "absolute",
    left: 16,
    top: 32
  },
  sheetHeader: {
    left: 16,
    top: 16
  },
  icon: {
    fontSize: 40,
    color: "white"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  text: {
    marginTop: 20,
    color: "white",
    fontSize: 60,
    fontWeight: "bold"
  }
});