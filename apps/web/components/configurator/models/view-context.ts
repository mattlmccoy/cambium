'use client';
import { createContext, useContext } from 'react';
export const ModelViewContext = createContext({ exploded: false, coreOnly: false });
export const useModelView = () => useContext(ModelViewContext);
