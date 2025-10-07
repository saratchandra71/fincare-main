import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useData } from '@/contexts/DataContext'
import { parseCSVFromUrl } from '@/services/csvService'
import { resolveDataUrl } from '@/services/api'

// KPI widgets (local)
import { ProductsServicesKPI } from './ProductsServicesKPI'
import { PriceValueKPI } from './PriceValueKPI'
import { ConsumerUnderstandingKPI } from './ConsumerUnderstandingKPI'
import { ConsumerSupportKPI } from './ConsumerSupportKPI'

interface FilteredData {
  productData: any[]
  priceData: any[]
  communicationData: any[]
  supportData: any[]
}

export function ConsumerDutyKPIDashboard() {
  const { allDatasetsLoaded } = useData()
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all')
  const [selectedProductType, setSelectedProductType] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<string>('all')

  const [filteredData, setFilteredData] = useState<FilteredData>({
    productData: [],
    priceData: [],
    communicationData: [],
    supportData: [],
  })

  const [productTypes, setProductTypes] = useState<string[]>([])
  const [products, setProducts] = useState<string[]>([])

  const outcomes = [
    { value: 'all', label: 'All Outcomes' },
    { value: 'products-services', label: 'Products & Services' },
    { value: 'price-value', label: 'Price & Value' },
    { value: 'consumer-understanding', label: 'Consumer Understanding' },
    { value: 'consumer-support', label: 'Consumer Support' },
  ]

  useEffect(() => {
    if (!allDatasetsLoaded) return
    ;(async () => {
      try {
        // Load all CSV via our parser (supports quotes, commas, newlines)
        const [productData, priceData, communicationData, supportData] = await Promise.all([
          parseCSVFromUrl(resolveDataUrl('ProductPerformance.csv')),
          parseCSVFromUrl(resolveDataUrl('PriceValue.csv')),
          parseCSVFromUrl(resolveDataUrl('ConsumerUnderstanding.csv')),
          parseCSVFromUrl(resolveDataUrl('ConsumerSupport.csv')),
        ])

        const uniqueProductTypes = [...new Set(productData.map((r: any) => r.Product_Type).filter(Boolean))]
        const uniqueProducts = [...new Set(productData.map((r: any) => r.Product_Name).filter(Boolean))]

        setProductTypes(uniqueProductTypes)
        setProducts(uniqueProducts)
        setFilteredData({ productData, priceData, communicationData, supportData })
      } catch (err) {
        console.error('Error loading data:', err)
      }
    })()
  }, [allDatasetsLoaded])

  // Re-apply filters whenever selection changes
  useEffect(() => {
    const applyFilters = () => {
      let productData = filteredData.productData
      let priceData = filteredData.priceData
      let communicationData = filteredData.communicationData
      let supportData = filteredData.supportData

      if (selectedProductType !== 'all') {
        productData = productData.filter((r: any) => r.Product_Type === selectedProductType)
        const ids = new Set(productData.map((r: any) => r.Product_ID))
        priceData = priceData.filter((r: any) => ids.has(r.Product_ID))
        communicationData = communicationData.filter((r: any) => ids.has(r.Product_ID))
        supportData = supportData.filter((r: any) => ids.has(r.Product_ID))
      }

      if (selectedProduct !== 'all') {
        productData = productData.filter((r: any) => r.Product_Name === selectedProduct)
        const ids = new Set(productData.map((r: any) => r.Product_ID))
        priceData = priceData.filter((r: any) => ids.has(r.Product_ID))
        communicationData = communicationData.filter((r: any) => ids.has(r.Product_ID))
        supportData = supportData.filter((r: any) => ids.has(r.Product_ID))
      }

      setFilteredData({ productData, priceData, communicationData, supportData })
    }
    if (filteredData.productData.length > 0) applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductType, selectedProduct])

  const availableProducts = useMemo(
    () =>
      selectedProductType === 'all'
        ? products
        : filteredData.productData.filter((r: any) => r.Product_Type === selectedProductType).map((r: any) => r.Product_Name),
    [selectedProductType, filteredData.productData, products]
  )

  if (!allDatasetsLoaded) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Datasets are not yet loaded. Please load datasets first to view KPIs.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Consumer Duty Stats</h1>
          <p className="text-muted-foreground">KPI dashboards for Consumer Duty outcomes</p>
        </div>
        <Badge variant="default" className="bg-green-600 text-white">All Datasets Loaded</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Outcome</label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {outcomes.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Product Category</label>
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {productTypes.map(pt => (<SelectItem key={pt} value={pt}>{pt}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {availableProducts.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI dashboards */}
      <div className="space-y-6">
        {(selectedOutcome === 'all' || selectedOutcome === 'products-services') && (
          <ProductsServicesKPI data={filteredData.productData} />
        )}
        {(selectedOutcome === 'all' || selectedOutcome === 'price-value') && (
          <PriceValueKPI data={filteredData.priceData} />
        )}
        {(selectedOutcome === 'all' || selectedOutcome === 'consumer-understanding') && (
          <ConsumerUnderstandingKPI data={filteredData.communicationData} />
        )}
        {(selectedOutcome === 'all' || selectedOutcome === 'consumer-support') && (
          <ConsumerSupportKPI data={filteredData.supportData} />
        )}
      </div>
    </div>
  )
}

export default ConsumerDutyKPIDashboard