import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { defaultGTMEInputs, defaultOutboundInputs } from "@/constants/defaultInputs";
import { defaultEventInputs } from "@/constants/eventDefaults";
import type {
  CalculatorState,
  CalculatorStep,
  EventInputs,
  EventResults,
  GTMEInputs,
  GTMEResults,
  LeadDetails,
  OutboundInputs,
  OutboundResults,
} from "@/types/calculator";

export type CalculatorAction =
  | { type: "SET_STEP"; payload: CalculatorStep }
  | { type: "SET_SELECTED_SERVICES"; payload: string[] }
  | { type: "UPDATE_OUTBOUND_INPUTS"; payload: Partial<OutboundInputs> }
  | { type: "UPDATE_GTME_INPUTS"; payload: Partial<GTMEInputs> }
  | { type: "UPDATE_EVENT_INPUTS"; payload: Partial<EventInputs> }
  | { type: "SET_LEAD_DETAILS"; payload: LeadDetails }
  /** Atomically saves lead details and moves to the confirmation interstitial (avoids split updates). */
  | { type: "COMMIT_LEAD_DETAILS_TO_CONFIRMATION"; payload: LeadDetails }
  | { type: "SET_OUTBOUND_RESULTS"; payload: OutboundResults | null }
  | { type: "SET_GTME_RESULTS"; payload: GTMEResults | null }
  | { type: "SET_EVENT_RESULTS"; payload: EventResults | null }
  | { type: "RESET" };

export const initialCalculatorState: CalculatorState = {
  currentStep: "select-services",
  selectedServices: [],
  outboundInputs: defaultOutboundInputs,
  gtmeInputs: defaultGTMEInputs,
  eventInputs: defaultEventInputs,
  leadDetails: {
    fullName: "",
    companyName: "",
    workEmail: "",
    phoneNumber: "",
    gdprConsent: false,
  },
  outboundResults: null,
  gtmeResults: null,
  eventResults: null,
};

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_SELECTED_SERVICES":
      return { ...state, selectedServices: action.payload };
    case "UPDATE_OUTBOUND_INPUTS":
      return {
        ...state,
        outboundInputs: { ...state.outboundInputs, ...action.payload },
      };
    case "UPDATE_GTME_INPUTS":
      return {
        ...state,
        gtmeInputs: { ...state.gtmeInputs, ...action.payload },
      };
    case "UPDATE_EVENT_INPUTS":
      return {
        ...state,
        eventInputs: { ...state.eventInputs, ...action.payload },
      };
    case "SET_LEAD_DETAILS":
      return { ...state, leadDetails: action.payload };
    case "COMMIT_LEAD_DETAILS_TO_CONFIRMATION":
      return {
        ...state,
        leadDetails: action.payload,
        currentStep: "confirmation",
      };
    case "SET_OUTBOUND_RESULTS":
      return { ...state, outboundResults: action.payload };
    case "SET_GTME_RESULTS":
      return { ...state, gtmeResults: action.payload };
    case "SET_EVENT_RESULTS":
      return { ...state, eventResults: action.payload };
    case "RESET":
      return initialCalculatorState;
    default:
      return state;
  }
}

interface CalculatorContextValue {
  state: CalculatorState;
  dispatch: Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextValue | undefined>(undefined);

interface CalculatorProviderProps {
  children: ReactNode;
}

export function CalculatorProvider({ children }: CalculatorProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalculator(): CalculatorContextValue {
  const context = useContext(CalculatorContext);

  if (!context) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }

  return context;
}
