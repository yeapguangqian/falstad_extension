// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXPORT_DATA") {
    // Collect all localStorage data
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    sendResponse({ data: data });
  }

  if (request.action === "IMPORT_DATA") {
    // Apply data to localStorage
    const data = request.payload;
    for (const key in data) {
      localStorage.setItem(key, data[key]);
    }
    sendResponse({ status: "success" });
  }
  
  if (request.action === "RESET_DATA") {
      // 1. Clear everything
      localStorage.clear();

      // 2. Restore your specific defaults
      localStorage.setItem(
          "shortcuts",
          "1;35=NorGateElm;49=InverterElm;50=AndGateElm;51=OrGateElm;52=XorGateElm;64=NandGateElm;65=OpAmpSwapElm;67=PolarCapacitorElm;76=InductorElm;78=NMosfetElm;80=PMosfetElm;82=RelayElm;83=Switch2Elm;84=TransformerElm;86=RailElm;96=LabeledNodeElm;97=OpAmpElm;98=BoxElm;99=CapacitorElm;100=DiodeElm;103=GroundElm;105=LogicInputElm;108=LEDElm;110=NTransistorElm;111=LogicOutputElm;112=PTransistorElm;114=ResistorElm;115=SwitchElm;116=TextElm;118=DCVoltageElm;119=WireElm;122=ZenerElm"
      );
      localStorage.setItem("crossHair", "true");

      sendResponse({ status: "reset_complete" });
  }
});