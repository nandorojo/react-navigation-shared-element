import * as React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { nodeFromRef } from 'react-native-shared-element';
import SharedElementSceneData from './SharedElementSceneData';
import SharedElementSceneContext from './SharedElementSceneContext';
import SharedElementRendererContext from './SharedElementRendererContext';
import {
  SharedElementItemConfig,
  SharedElementConfig,
  SharedElementEventSubscription,
} from './types';
import SharedElementRendererData from './SharedElementRendererData';
//import invariant from '../utils/invariant';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function normalizeSharedElementConfig(
  sharedElementConfig: any
): SharedElementItemConfig {
  if (typeof sharedElementConfig === 'string') {
    return {
      id: sharedElementConfig,
      animation: 'move',
      sourceId: sharedElementConfig,
    };
  } else {
    return {
      animation: 'move',
      ...sharedElementConfig,
    };
  }
}

function normalizeSharedElementsConfig(
  sharedElementsConfig: any
): SharedElementConfig | null {
  if (!sharedElementsConfig) return null;
  if (Array.isArray(sharedElementsConfig)) {
    if (!sharedElementsConfig.length) return null;
    return sharedElementsConfig.map(normalizeSharedElementConfig);
  } else {
    const keys = Object.keys(sharedElementsConfig);
    if (!keys.length) return null;
    return keys.map(id => {
      const value = sharedElementsConfig[id];
      return {
        id,
        sourceId: id,
        ...(typeof value === 'string' ? { animation: value } : value),
      };
    });
  }
}

type PropsType = {
  navigation: any;
};

function createSharedElementScene(
  Component: React.ComponentType<any>
): React.ComponentType<any> {
  class SharedElementSceneView extends React.PureComponent<PropsType> {
    private subscriptions: {
      [key: string]: SharedElementEventSubscription;
    } = {};
    private sceneData: SharedElementSceneData = new SharedElementSceneData();
    private rendererData: SharedElementRendererData | null = null;

    componentDidMount() {
      const { navigation } = this.props;
      this.subscriptions = {
        willFocus: navigation.addListener('willFocus', this.onWillFocus),
        //willBlur: navigation.addListener('willBlur', this.onWillBlur),
        didFocus: navigation.addListener('didFocus', this.onDidFocus),
        //didBlur: navigation.addListener('didBlur', this.onDidBlur),
      };
    }

    componentWillUnmount() {
      Object.values(this.subscriptions).forEach(subscription =>
        subscription.remove()
      );
    }

    render() {
      // console.log('SharedElementSceneView.render');
      return (
        <SharedElementRendererContext.Consumer>
          {rendererData => {
            /*invariant(
              rendererContext != null,
              'The SharedElementRenderContext is not set, did you forget to wrap your Navigator with `createSharedElementRenderer(..)`?'
            );*/
            this.rendererData = rendererData;
            return (
              <SharedElementSceneContext.Provider value={this.sceneData}>
                <View
                  style={styles.container}
                  collapsable={false}
                  ref={this.onSetRef}
                >
                  <Component {...this.props} />
                </View>
              </SharedElementSceneContext.Provider>
            );
          }}
        </SharedElementRendererContext.Consumer>
      );
    }

    private onSetRef = (ref: any) => {
      this.sceneData.setAncestor(nodeFromRef(ref));
    };

    private onWillFocus = () => {
      // console.log('SharedElementSceneView.onWillFocus');
      const animValue = new Animated.Value(0);
      const sharedElements = normalizeSharedElementsConfig(
        this.props.navigation.getParam('sharedElements')
      );
      if (this.rendererData && sharedElements) {
        Animated.timing(animValue, {
          // TEMP
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
        this.rendererData.willActivateScene(
          this.sceneData,
          sharedElements,
          animValue
        );
      }
    };

    private onDidFocus = () => {
      // console.log('SharedElementSceneView.onDidFocus');
      if (this.rendererData) {
        this.rendererData.didActivateScene(this.sceneData);
      }
    };

    /*onWillBlur = () => {
      console.log('onWillBlur');
    };

    onDidBlur = () => {
      console.log('onDidBlur');
    };*/
  }

  hoistNonReactStatics(SharedElementSceneView, Component);
  return SharedElementSceneView;
}

export default createSharedElementScene;