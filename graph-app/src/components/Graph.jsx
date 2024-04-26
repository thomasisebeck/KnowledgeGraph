import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const Graph = () => {
  const container = useRef(null);

  const nodes = [
    { id: 1, label: 'Animals'},
    { id: 2, label: 'Plants' },
    { id: 3, label: 'Mammals' },
    { id: 4, label: 'Reptiles' },
    { id: 5, label: 'Dogs' },
    { id: 6, label: 'Cats' },
    { id: 7, label: 'Trees' },
    { id: 8, label: 'Flowers' },
    { id: 9, label: 'Sports Cars' },
    { id: 10, label: 'Electric Cars' },
    { id: 11, label: 'Fruits' },
    { id: 12, label: 'Vegetables' },
    { id: 13, label: 'Books' },
    { id: 14, label: 'Movies' },
    { id: 15, label: 'Mountains' },
    { id: 16, label: 'Rivers' },
    { id: 17, label: 'Oceans' },
    { id: 18, label: 'Computers' },
    { id: 19, label: 'Smartphones' },
    { id: 20, label: 'Tablets' }
  ];

  const edges = [
    { id: 1, from: 1, to: 3, label: "Subset of", arrows: "to" },
    { id: 2, from: 1, to: 4, label: "Subset of", arrows: "to" },
    { id: 3, from: 3, to: 5, label: "Example of", arrows: "to" },
    { id: 4, from: 3, to: 6, label: "Example of", arrows: "to" },
    { id: 5, from: 2, to: 7, label: "Subset of", arrows: "to" },
    { id: 6, from: 2, to: 8, label: "Subset of", arrows: "to" },
    { id: 7, from: 9, to: 10, label: "Type of", arrows: "to" },
    { id: 8, from: 11, to: 12, label: "Related to", arrows: "to" },
    { id: 9, from: 13, to: 14, label: "Similar to", arrows: "to" },
    { id: 10, from: 15, to: 16, label: "Connected by", arrows: "to" },
    { id: 11, from: 15, to: 17, label: "Adjacent to", arrows: "to" },
    { id: 12, from: 18, to: 19, label: "Compatible with", arrows: "to" },
    { id: 13, from: 18, to: 20, label: "Similar to", arrows: "to" },
    { id: 14, from: 4, to: 5, label: "Subtype of", arrows: "to" },
    { id: 15, from: 4, to: 6, label: "Subtype of", arrows: "to" },
    { id: 16, from: 16, to: 17, label: "Merge into", arrows: "to" },
    { id: 17, from: 16, to: 15, label: "Flow towards", arrows: "to" },
    { id: 18, from: 5, to: 6, label: "Interact with", arrows: "to" },
    { id: 19, from: 6, to: 3, label: "Classified as", arrows: "to" },
    { id: 20, from: 10, to: 9, label: "Comparable to", arrows: "to" },
    { id: 21, from: 9, to: 4, label: "Associated with", arrows: "to" }
  ];


  const options = {

  };

  useEffect(() => {
    container.current &&
    new Network(container.current, { nodes, edges }, options);
  }, [
    container, nodes, edges, options]);

  return <div ref={container} style={{ height: '500px', width: '800px' }} />;
};

export default Graph;