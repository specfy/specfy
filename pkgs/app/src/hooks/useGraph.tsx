/* eslint-disable @typescript-eslint/no-empty-function */
import type { Graph } from '@antv/x6';
import { useMemo, createContext, useContext, useState } from 'react';

interface GraphContextInterface {
  highlight: string | undefined;
  prevHighlight: string | undefined;
  setRef: (graph: Graph) => void;
  getRef: () => Graph | undefined;
  recenter: (minus?: number) => void;
  setHighlight: (id: string) => void;
  unsetHighlight: (clear?: true) => void;
}

const GraphContext = createContext<GraphContextInterface>(
  {} as GraphContextInterface
);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [graph, setGraph] = useState<Graph>();
  const [highlight, setHighlight] = useState<string>();
  const [prevHighlight, setPrevHighlight] = useState<string>();

  const value = useMemo<GraphContextInterface>(() => {
    return {
      highlight,
      prevHighlight,
      setRef(val) {
        setGraph(val);
      },
      getRef() {
        return graph;
      },
      recenter: (minus: number = 0.15) => {
        if (!graph) {
          return;
        }

        graph.zoomToFit({ padding: 40, maxScale: 2.6, minScale: 0.2 });
        graph.zoomTo(graph.zoom() - minus);
      },
      setHighlight(id) {
        setPrevHighlight(highlight);
        return setHighlight(id);
      },
      unsetHighlight(clear) {
        setHighlight(undefined);
        if (clear) {
          setPrevHighlight(undefined);
        }
      },
    };
  }, [graph, highlight]);

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
};

export const useGraph = (): GraphContextInterface => {
  return useContext(GraphContext);
};
