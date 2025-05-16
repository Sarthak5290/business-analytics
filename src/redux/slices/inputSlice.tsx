// src/redux/slices/inputSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InputState {
  user_input: string;
  problem: string;
  target_customers: string;
  solution: string;
  key_resources: string;
  revenue_streams: string;
}

const initialState: InputState = {
  user_input: "Online education platform for coding skills",
  problem:
    "Many people want to learn coding but traditional courses are expensive and inflexible. Our platform offers affordable, flexible, and interactive coding courses specializing in web development, mobile app development, and data science. We provide project-based learning with real-world applications, personalized feedback, and a supportive community.",
  target_customers:
    "Our target customers include career changers (25-40 years old) looking to transition into tech roles, college students seeking practical skills to complement their degrees, self-taught developers wanting structured learning, and professionals needing to upskill in specific technologies. They are typically tech-savvy, motivated learners with limited time who prefer flexible learning options.",
  solution:
    "Our solution is an interactive coding platform that combines video lessons, coding challenges, real-world projects, and community support. Students learn by building actual applications from day one. Key features include: personalized learning paths, instant feedback on code, mentor support through video calls, peer review system, and career services (resume review, interview prep, and job placement assistance).",
  key_resources:
    "Experienced instructors, engaging curriculum, robust learning platform, cloud infrastructure, course development team, customer support, marketing expertise, industry partnerships, venture capital funding",
  revenue_streams:
    "Monthly subscription: $29/month, Annual subscription: $299/year, Premium tier: $49/month, Enterprise packages: $999/month, Career services package: $499 one-time fee, Private tutoring: $79/hour",
};

export const inputSlice = createSlice({
  name: "input",
  initialState,
  reducers: {
    setInputText: (state, action: PayloadAction<string>) => {
      state.user_input = action.payload;
    },
    setProblem: (state, action: PayloadAction<string>) => {
      state.problem = action.payload;
    },
    setTargetCustomers: (state, action: PayloadAction<string>) => {
      state.target_customers = action.payload;
    },
    setSolution: (state, action: PayloadAction<string>) => {
      state.solution = action.payload;
    },
    setKeyResources: (state, action: PayloadAction<string>) => {
      state.key_resources = action.payload;
    },
    setRevenueStreams: (state, action: PayloadAction<string>) => {
      state.revenue_streams = action.payload;
    },
    setAllFields: (state, action: PayloadAction<InputState>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setInputText,
  setProblem,
  setTargetCustomers,
  setSolution,
  setKeyResources,
  setRevenueStreams,
  setAllFields,
} = inputSlice.actions;

export default inputSlice.reducer;
