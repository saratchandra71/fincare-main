
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { DataProvider } from '@/contexts/DataContext'
import { VulnerabilityProvider } from '@/contexts/VulnerabilityContext'
import { AppSidebar } from '@/components/AppSidebar'

// Pages (stubs)
import Dashboard from '@/pages/Dashboard'
import ConsumerDuty from '@/pages/consumer-duty/ConsumerDuty'
import ConsumerDutyStats from '@/pages/consumer-duty/ConsumerDutyStats'
import Datasets from '@/pages/consumer-duty/Datasets'
import ProductsServicesAnalysis from '@/pages/consumer-duty/ProductsServicesAnalysis'
import PriceValueAnalysis from '@/pages/consumer-duty/PriceValueAnalysis'
import ConsumerUnderstandingAnalysis from '@/pages/consumer-duty/ConsumerUnderstandingAnalysis'
import ConsumerSupportAnalysis from '@/pages/consumer-duty/ConsumerSupportAnalysis'
import VulnerableCustomers from '@/pages/vulnerable-customers/VulnerableCustomers'
import VulnerabilityStats from '@/pages/vulnerable-customers/VulnerabilityStats'
import VulnerableCustomerList from '@/pages/vulnerable-customers/VulnerableCustomerList'
import AuditLog from '@/pages/audit/AuditLog'
import AuditTrail from '@/pages/audit/AuditTrail'
import AuditReport from '@/pages/audit/AuditReport'
import PromptLibrary from '@/pages/prompts/PromptLibrary'
import PromptLog from '@/pages/prompts/PromptLog'
import NotFound from '@/pages/NotFound'

import '@/index.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <DataProvider>
            <VulnerabilityProvider>
              <BrowserRouter>
                <div className='flex min-h-screen'>
                  <AppSidebar />
                  <main className='flex-1 p-4'>
                    <Routes>
                      <Route path='/' element={<Dashboard />} />

                      {/* Consumer Duty */}
                      <Route path='/consumer-duty' element={<ConsumerDuty />} />
                      <Route path='/consumer-duty/stats' element={<ConsumerDutyStats />} />
                      <Route path='/consumer-duty/datasets' element={<Datasets />} />
                      <Route path='/consumer-duty/products-services' element={<ProductsServicesAnalysis />} />
                      <Route path='/consumer-duty/price-value' element={<PriceValueAnalysis />} />
                      <Route path='/consumer-duty/understanding' element={<ConsumerUnderstandingAnalysis />} />
                      <Route path='/consumer-duty/support' element={<ConsumerSupportAnalysis />} />

                      {/* Vulnerable Customers */}
                      <Route path='/vulnerable-customers' element={<VulnerableCustomers />} />
                      <Route path='/vulnerable-customers/stats' element={<VulnerabilityStats />} />
                      <Route path='/vulnerable-customers/list' element={<VulnerableCustomerList />} />

                      {/* Audit */}
                      <Route path='/audit/log' element={<AuditLog />} />
                      <Route path='/audit/trail' element={<AuditTrail />} />
                      <Route path='/audit/report' element={<AuditReport />} />

                      {/* Prompts */}
                      <Route path='/prompts/library' element={<PromptLibrary />} />
                      <Route path='/prompts/log' element={<PromptLog />} />

                      <Route path='*' element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </BrowserRouter>
              <Sonner />
            </VulnerabilityProvider>
          </DataProvider>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
