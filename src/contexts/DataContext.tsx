
import React, { createContext, useContext, useMemo, useState } from 'react'

export type DatasetItem = {
  name: string
  filename: string
  loaded?: boolean
  loading?: boolean
  error?: string
  dataCount?: number
}

interface DataContextValue {
  datasets: DatasetItem[]
  setDatasets: React.Dispatch<React.SetStateAction<DatasetItem[]>>
  allDatasetsLoaded: boolean
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<DatasetItem[]>([
    { name: 'ProductData', filename: 'ProductPerformance.csv' },
    { name: 'PricingData', filename: 'PriceValue.csv' },
    { name: 'CommData', filename: 'ConsumerUnderstanding.csv' },
    { name: 'SupportData', filename: 'ConsumerSupport.csv' },
  ])

  const allDatasetsLoaded = useMemo(() => datasets.every(d => d.loaded), [datasets])

  return (
    <DataContext.Provider value={{ datasets, setDatasets, allDatasetsLoaded }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
