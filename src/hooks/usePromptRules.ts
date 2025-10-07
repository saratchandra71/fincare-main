
// src/hooks/usePromptRules.ts
import { useCallback, useEffect, useState } from 'react'
import { getPSRulesFromPromptLibrary, getPVRulesFromPromptLibrary, getCURulesFromPromptLibrary, getCSRRulesFromPromptLibrary, type PSRules, type PVRules, type CURules, type CSRRules } from '@/lib/promptRules'

export function usePromptRules() {
  const [ps, setPS] = useState<PSRules>(() => getPSRulesFromPromptLibrary())
  const [pv, setPV] = useState<PVRules>(() => getPVRulesFromPromptLibrary())
  const [cu, setCU] = useState<CURules>(() => getCURulesFromPromptLibrary())
  const [cs, setCS] = useState<CSRRules>(() => getCSRRulesFromPromptLibrary())

  const refresh = useCallback(() => {
    setPS(getPSRulesFromPromptLibrary())
    setPV(getPVRulesFromPromptLibrary())
    setCU(getCURulesFromPromptLibrary())
    setCS(getCSRRulesFromPromptLibrary())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'prompt-library-data' || e.key === null) refresh()
    }
    const onCustom = () => refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener('prompt-thresholds-updated', onCustom as any)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('prompt-thresholds-updated', onCustom as any)
    }
  }, [refresh])

  return { ps, pv, cu, cs, refresh }
}
