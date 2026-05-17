import { useState } from "react";
import type { Locale } from "../../i18n/locales";
import { adjacency, matrixValue, roomLabel, rooms, type RoomId } from "./graphBasicsTrace";

type Operation = "reset" | "list-hall" | "check-lab-cafe" | "add-cafe-lab";

const labels = {
  en: {
    title: "Representation comparison",
    reset: "Reset",
    listHall: "List Hall neighbors",
    checkLabCafe: "Check Lab-Cafe",
    addCafeLab: "Add Cafe-Lab",
    result: "Result",
    list: "Adjacency list",
    matrix: "Adjacency matrix",
    choose: "Choose an operation to compare the two representations.",
    hall: "Hall connects to Lobby, Lab, and Cafe.",
    labCafe: "No direct door connects Lab and Cafe in the base fixture.",
    add: "Adding Cafe-Lab changes adjacency, so both representations need one new connection."
  },
  zh: {
    title: "表示法对比",
    reset: "重置",
    listHall: "列出 Hall 邻居",
    checkLabCafe: "检查 Lab-Cafe",
    addCafeLab: "新增 Cafe-Lab",
    result: "结果",
    list: "邻接表",
    matrix: "邻接矩阵",
    choose: "选择一个操作，对比两种表示法。",
    hall: "Hall 连接到 Lobby、Lab 和 Cafe。",
    labCafe: "在基础例子中，Lab 和 Cafe 没有直接门。",
    add: "新增 Cafe-Lab 会改变邻接关系，所以两种表示法都需要新增一条连接。"
  }
};

function adjacencyFor(operation: Operation): Record<RoomId, RoomId[]> {
  if (operation !== "add-cafe-lab") return adjacency;
  return {
    ...adjacency,
    cafe: [...adjacency.cafe, "lab"],
    lab: [...adjacency.lab, "cafe"]
  };
}

function resultFor(operation: Operation, lang: Locale) {
  if (operation === "list-hall") return labels[lang].hall;
  if (operation === "check-lab-cafe") return labels[lang].labCafe;
  if (operation === "add-cafe-lab") return labels[lang].add;
  return labels[lang].choose;
}

export default function GraphRepresentationCompare({ lang }: { lang: Locale }) {
  const [operation, setOperation] = useState<Operation>("reset");
  const currentAdjacency = adjacencyFor(operation);
  const highlightedRows: RoomId[] = operation === "list-hall" ? ["hall"] : operation === "check-lab-cafe" ? ["lab", "cafe"] : operation === "add-cafe-lab" ? ["lab", "cafe"] : [];
  const highlightedCells = new Set<string>();
  if (operation === "list-hall") {
    for (const id of adjacency.hall) {
      highlightedCells.add(`hall-${id}`);
      highlightedCells.add(`${id}-hall`);
    }
  }
  if (operation === "check-lab-cafe") {
    highlightedCells.add("lab-cafe");
    highlightedCells.add("cafe-lab");
  }
  if (operation === "add-cafe-lab") {
    highlightedCells.add("lab-cafe");
    highlightedCells.add("cafe-lab");
  }

  return (
    <section className="graph-representation-compare" aria-label={labels[lang].title}>
      <p className="state-label">{labels[lang].title}</p>
      <div className="mode-group" role="group" aria-label={labels[lang].title}>
        <button type="button" className={operation === "list-hall" ? "active" : ""} onClick={() => setOperation("list-hall")}>{labels[lang].listHall}</button>
        <button type="button" className={operation === "check-lab-cafe" ? "active" : ""} onClick={() => setOperation("check-lab-cafe")}>{labels[lang].checkLabCafe}</button>
        <button type="button" className={operation === "add-cafe-lab" ? "active" : ""} onClick={() => setOperation("add-cafe-lab")}>{labels[lang].addCafeLab}</button>
        <button type="button" onClick={() => setOperation("reset")}>{labels[lang].reset}</button>
      </div>
      <p aria-live="polite"><strong>{labels[lang].result}:</strong> {resultFor(operation, lang)}</p>
      <div className="gb-two-column">
        <div>
          <h3>{labels[lang].list}</h3>
          <div className="gb-adjacency compact">
            {(Object.entries(currentAdjacency) as Array<[RoomId, RoomId[]]>).map(([id, neighbors]) => (
              <div key={id} className={highlightedRows.includes(id) ? "highlighted" : ""}>
                <strong>{roomLabel(id, lang)}</strong>
                <span>{neighbors.map((neighbor) => roomLabel(neighbor, lang)).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>{labels[lang].matrix}</h3>
          <table className="gb-matrix">
            <caption>{lang === "en" ? "Rows are from rooms; columns are to rooms." : "行表示出发房间，列表示到达房间。"}</caption>
            <thead>
              <tr>
                <th scope="col" />
                {rooms.map((room) => <th key={room.id} scope="col">{room.label[lang]}</th>)}
              </tr>
            </thead>
            <tbody>
              {rooms.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.label[lang]}</th>
                  {rooms.map((column) => {
                    const value = operation === "add-cafe-lab" && ((row.id === "lab" && column.id === "cafe") || (row.id === "cafe" && column.id === "lab"))
                      ? 1
                      : matrixValue(row.id, column.id);
                    return (
                      <td key={column.id} className={highlightedCells.has(`${row.id}-${column.id}`) ? "highlighted" : ""}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
