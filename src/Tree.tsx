import { useContext } from "react";
import Tree from "react-d3-tree";
import { MyContext } from "./context";

Worker.prototype.emit = function (...data) {
  this.postMessage({ type: data[0], data: data[1] });
};

function Treee() {
  const { tree } = useContext(MyContext);

  return <Tree data={tree} orientation="vertical" />;
}

export default Treee;
