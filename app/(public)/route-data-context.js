"use client";

import React, { createContext, useContext } from 'react';

const RouteDataContext = createContext({});

export const RouteDataProvider = ({ data, children }) => {
  return <RouteDataContext.Provider value={data || {}}>{children}</RouteDataContext.Provider>;
};

export const useRouteData = () => useContext(RouteDataContext);
