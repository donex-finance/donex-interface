import { BigNumber } from '@ethersproject/bignumber'
import JSBI from 'jsbi'
import { useMemo } from 'react'

import { useV3NFTPositionManagerContract } from './useContract'

type TokenId = number | JSBI | BigNumber

const STARTS_WITH = 'data:application/json;base64,'

type UsePositionTokenURIResult =
  | {
      valid: true
      loading: false
      result: {
        name: string
        description: string
        image: string
      }
    }
  | {
      valid: false
      loading: false
    }
  | {
      valid: true
      loading: true
    }

export function usePositionTokenURI(tokenId: TokenId | undefined): UsePositionTokenURIResult {
  const contract = useV3NFTPositionManagerContract()
  const inputs = useMemo(
    () => [tokenId instanceof BigNumber ? tokenId.toHexString() : tokenId?.toString(16)],
    [tokenId]
  )
  // const { error, loading, valid } = useSingleCallResult(contract, 'tokenURI', inputs, {
  //   ...NEVER_RELOAD,
  //   gasRequired: 3_000_000,
  // })
  const error = ''
  const loading = false
  const valid = true
  const result = [
    'data:application/json;base64,eyJuYW1lIjoiVW5pc3dhcCAtIDAuMyUgLSBVTkkvV0VUSCAtIDEuMDAwMDw+OTk3LjkwIiwgImRlc2NyaXB0aW9uIjoiVGhpcyBORlQgcmVwcmVzZW50cyBhIGxpcXVpZGl0eSBwb3NpdGlvbiBpbiBhIFVuaXN3YXAgVjMgVU5JLVdFVEggcG9vbC4gVGhlIG93bmVyIG9mIHRoaXMgTkZUIGNhbiBtb2RpZnkgb3IgcmVkZWVtIHRoZSBwb3NpdGlvbi5cblxuUG9vbCBBZGRyZXNzOiAweDRkMTg5MmYxNWIwM2RiMjRiNTVlNzNmOTgwMTgyNmE1NmQ2ZjA3NTVcblVOSSBBZGRyZXNzOiAweDFmOTg0MGE4NWQ1YWY1YmYxZDE3NjJmOTI1YmRhZGRjNDIwMWY5ODRcbldFVEggQWRkcmVzczogMHhiNGZiZjI3MTE0M2Y0ZmJmN2I5MWE1ZGVkMzE4MDVlNDJiMjIwOGQ2XG5GZWUgVGllcjogMC4zJVxuVG9rZW4gSUQ6IDFcblxu4pqg77iPIERJU0NMQUlNRVI6IER1ZSBkaWxpZ2VuY2UgaXMgaW1wZXJhdGl2ZSB3aGVuIGFzc2Vzc2luZyB0aGlzIE5GVC4gTWFrZSBzdXJlIHRva2VuIGFkZHJlc3NlcyBtYXRjaCB0aGUgZXhwZWN0ZWQgdG9rZW5zLCBhcyB0b2tlbiBzeW1ib2xzIG1heSBiZSBpbWl0YXRlZC4iLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCM2FXUjBhRDBpTWprd0lpQm9aV2xuYUhROUlqVXdNQ0lnZG1sbGQwSnZlRDBpTUNBd0lESTVNQ0ExTURBaUlIaHRiRzV6UFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXdMM04yWnlJZ2VHMXNibk02ZUd4cGJtczlKMmgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MekU1T1RrdmVHeHBibXNuUGp4a1pXWnpQanhtYVd4MFpYSWdhV1E5SW1ZeElqNDhabVZKYldGblpTQnlaWE4xYkhROUluQXdJaUI0YkdsdWF6cG9jbVZtUFNKa1lYUmhPbWx0WVdkbEwzTjJaeXQ0Yld3N1ltRnpaVFkwTEZCSVRqSmFlVUl6WVZkU01HRkVNRzVOYW10M1NubENiMXBYYkc1aFNGRTVTbnBWZDAxRFkyZGtiV3hzWkRCS2RtVkVNRzVOUTBGM1NVUkpOVTFEUVRGTlJFRnVTVWhvZEdKSE5YcFFVMlJ2WkVoU2QwOXBPSFprTTJRelRHNWpla3h0T1hsYWVUaDVUVVJCZDB3elRqSmFlV01yVUVoS2JGa3pVV2RrTW14clpFZG5PVXA2U1RWTlNFSTBTbmxDYjFwWGJHNWhTRkU1U25wVmQwMUlRalJLZVVKdFlWZDRjMUJUWTJwTlYxazFUMFJSZDBwNU9DdFFRemw2Wkcxakt5SXZQanhtWlVsdFlXZGxJSEpsYzNWc2REMGljREVpSUhoc2FXNXJPbWh5WldZOUltUmhkR0U2YVcxaFoyVXZjM1puSzNodGJEdGlZWE5sTmpRc1VFaE9NbHA1UWpOaFYxSXdZVVF3YmsxcWEzZEtlVUp2V2xkc2JtRklVVGxLZWxWM1RVTmpaMlJ0Ykd4a01FcDJaVVF3YmsxRFFYZEpSRWsxVFVOQk1VMUVRVzVKU0doMFlrYzFlbEJUWkc5a1NGSjNUMms0ZG1RelpETk1ibU42VEcwNWVWcDVPSGxOUkVGM1RETk9NbHA1WXl0UVIwNXdZMjFPYzFwVFFtcGxSREJ1VFZSamJrbEhUalZRVTJONFRsUkZia2xJU1RsS2VrVjVUVWhDTkVwNVFtMWhWM2h6VUZOamFsbHFVbTFaYlZsNVNuazRLMUJET1hwa2JXTXJJaTgrUEdabFNXMWhaMlVnY21WemRXeDBQU0p3TWlJZ2VHeHBibXM2YUhKbFpqMGlaR0YwWVRwcGJXRm5aUzl6ZG1jcmVHMXNPMkpoYzJVMk5DeFFTRTR5V25sQ00yRlhVakJoUkRCdVRXcHJkMHA1UW05YVYyeHVZVWhST1VwNlZYZE5RMk5uWkcxc2JHUXdTblpsUkRCdVRVTkJkMGxFU1RWTlEwRXhUVVJCYmtsSWFIUmlSelY2VUZOa2IyUklVbmRQYVRoMlpETmtNMHh1WTNwTWJUbDVXbms0ZVUxRVFYZE1NMDR5V25saksxQkhUbkJqYlU1eldsTkNhbVZFTUc1TmFrMDBTbmxDYW1WVU1HNU9SRkY2U25sQ2VWQlRZM2hOYWtKM1pVTmpaMXB0YkhOaVJEQnVTWHBCZUZwcWF6Uk9RMk4yVUdwM2RtTXpXbTVRWnowOUlpQXZQanhtWlVsdFlXZGxJSEpsYzNWc2REMGljRE1pSUhoc2FXNXJPbWh5WldZOUltUmhkR0U2YVcxaFoyVXZjM1puSzNodGJEdGlZWE5sTmpRc1VFaE9NbHA1UWpOaFYxSXdZVVF3YmsxcWEzZEtlVUp2V2xkc2JtRklVVGxLZWxWM1RVTmpaMlJ0Ykd4a01FcDJaVVF3YmsxRFFYZEpSRWsxVFVOQk1VMUVRVzVKU0doMFlrYzFlbEJUWkc5a1NGSjNUMms0ZG1RelpETk1ibU42VEcwNWVWcDVPSGxOUkVGM1RETk9NbHA1WXl0UVIwNXdZMjFPYzFwVFFtcGxSREJ1VFdwQk0wcDVRbXBsVkRCdVRWUk5Na3A1UW5sUVUyTjRUVVJDZDJWRFkyZGFiV3h6WWtRd2JrbDZTWGxOUkdoclRtbGpkbEJxZDNaak0xcHVVR2M5UFNJZ0x6NDhabVZDYkdWdVpDQnRiMlJsUFNKdmRtVnliR0Y1SWlCcGJqMGljREFpSUdsdU1qMGljREVpSUM4K1BHWmxRbXhsYm1RZ2JXOWtaVDBpWlhoamJIVnphVzl1SWlCcGJqSTlJbkF5SWlBdlBqeG1aVUpzWlc1a0lHMXZaR1U5SW05MlpYSnNZWGtpSUdsdU1qMGljRE1pSUhKbGMzVnNkRDBpWW14bGJtUlBkWFFpSUM4K1BHWmxSMkYxYzNOcFlXNUNiSFZ5SUdsdVBTSmliR1Z1WkU5MWRDSWdjM1JrUkdWMmFXRjBhVzl1UFNJME1pSWdMejQ4TDJacGJIUmxjajRnUEdOc2FYQlFZWFJvSUdsa1BTSmpiM0p1WlhKeklqNDhjbVZqZENCM2FXUjBhRDBpTWprd0lpQm9aV2xuYUhROUlqVXdNQ0lnY25nOUlqUXlJaUJ5ZVQwaU5ESWlJQzgrUEM5amJHbHdVR0YwYUQ0OGNHRjBhQ0JwWkQwaWRHVjRkQzF3WVhSb0xXRWlJR1E5SWswME1DQXhNaUJJTWpVd0lFRXlPQ0F5T0NBd0lEQWdNU0F5TnpnZ05EQWdWalEyTUNCQk1qZ2dNamdnTUNBd0lERWdNalV3SURRNE9DQklOREFnUVRJNElESTRJREFnTUNBeElERXlJRFEyTUNCV05EQWdRVEk0SURJNElEQWdNQ0F4SURRd0lERXlJSG9pSUM4K1BIQmhkR2dnYVdROUltMXBibWx0WVhBaUlHUTlJazB5TXpRZ05EUTBRekl6TkNBME5UY3VPVFE1SURJME1pNHlNU0EwTmpNZ01qVXpJRFEyTXlJZ0x6NDhabWxzZEdWeUlHbGtQU0owYjNBdGNtVm5hVzl1TFdKc2RYSWlQanhtWlVkaGRYTnphV0Z1UW14MWNpQnBiajBpVTI5MWNtTmxSM0poY0docFl5SWdjM1JrUkdWMmFXRjBhVzl1UFNJeU5DSWdMejQ4TDJacGJIUmxjajQ4YkdsdVpXRnlSM0poWkdsbGJuUWdhV1E5SW1keVlXUXRkWEFpSUhneFBTSXhJaUI0TWowaU1DSWdlVEU5SWpFaUlIa3lQU0l3SWo0OGMzUnZjQ0J2Wm1aelpYUTlJakF1TUNJZ2MzUnZjQzFqYjJ4dmNqMGlkMmhwZEdVaUlITjBiM0F0YjNCaFkybDBlVDBpTVNJZ0x6NDhjM1J2Y0NCdlptWnpaWFE5SWk0NUlpQnpkRzl3TFdOdmJHOXlQU0ozYUdsMFpTSWdjM1J2Y0MxdmNHRmphWFI1UFNJd0lpQXZQand2YkdsdVpXRnlSM0poWkdsbGJuUStQR3hwYm1WaGNrZHlZV1JwWlc1MElHbGtQU0puY21Ga0xXUnZkMjRpSUhneFBTSXdJaUI0TWowaU1TSWdlVEU5SWpBaUlIa3lQU0l4SWo0OGMzUnZjQ0J2Wm1aelpYUTlJakF1TUNJZ2MzUnZjQzFqYjJ4dmNqMGlkMmhwZEdVaUlITjBiM0F0YjNCaFkybDBlVDBpTVNJZ0x6NDhjM1J2Y0NCdlptWnpaWFE5SWpBdU9TSWdjM1J2Y0MxamIyeHZjajBpZDJocGRHVWlJSE4wYjNBdGIzQmhZMmwwZVQwaU1DSWdMejQ4TDJ4cGJtVmhja2R5WVdScFpXNTBQanh0WVhOcklHbGtQU0ptWVdSbExYVndJaUJ0WVhOclEyOXVkR1Z1ZEZWdWFYUnpQU0p2WW1wbFkzUkNiM1Z1WkdsdVowSnZlQ0krUEhKbFkzUWdkMmxrZEdnOUlqRWlJR2hsYVdkb2REMGlNU0lnWm1sc2JEMGlkWEpzS0NObmNtRmtMWFZ3S1NJZ0x6NDhMMjFoYzJzK1BHMWhjMnNnYVdROUltWmhaR1V0Wkc5M2JpSWdiV0Z6YTBOdmJuUmxiblJWYm1sMGN6MGliMkpxWldOMFFtOTFibVJwYm1kQ2IzZ2lQanh5WldOMElIZHBaSFJvUFNJeElpQm9aV2xuYUhROUlqRWlJR1pwYkd3OUluVnliQ2dqWjNKaFpDMWtiM2R1S1NJZ0x6NDhMMjFoYzJzK1BHMWhjMnNnYVdROUltNXZibVVpSUcxaGMydERiMjUwWlc1MFZXNXBkSE05SW05aWFtVmpkRUp2ZFc1a2FXNW5RbTk0SWo0OGNtVmpkQ0IzYVdSMGFEMGlNU0lnYUdWcFoyaDBQU0l4SWlCbWFXeHNQU0ozYUdsMFpTSWdMejQ4TDIxaGMycytQR3hwYm1WaGNrZHlZV1JwWlc1MElHbGtQU0puY21Ga0xYTjViV0p2YkNJK1BITjBiM0FnYjJabWMyVjBQU0l3TGpjaUlITjBiM0F0WTI5c2IzSTlJbmRvYVhSbElpQnpkRzl3TFc5d1lXTnBkSGs5SWpFaUlDOCtQSE4wYjNBZ2IyWm1jMlYwUFNJdU9UVWlJSE4wYjNBdFkyOXNiM0k5SW5kb2FYUmxJaUJ6ZEc5d0xXOXdZV05wZEhrOUlqQWlJQzgrUEM5c2FXNWxZWEpIY21Ga2FXVnVkRDQ4YldGemF5QnBaRDBpWm1Ga1pTMXplVzFpYjJ3aUlHMWhjMnREYjI1MFpXNTBWVzVwZEhNOUluVnpaWEpUY0dGalpVOXVWWE5sSWo0OGNtVmpkQ0IzYVdSMGFEMGlNamt3Y0hnaUlHaGxhV2RvZEQwaU1qQXdjSGdpSUdacGJHdzlJblZ5YkNnalozSmhaQzF6ZVcxaWIyd3BJaUF2UGp3dmJXRnphejQ4TDJSbFpuTStQR2NnWTJ4cGNDMXdZWFJvUFNKMWNtd29JMk52Y201bGNuTXBJajQ4Y21WamRDQm1hV3hzUFNJeFpqazROREFpSUhnOUlqQndlQ0lnZVQwaU1IQjRJaUIzYVdSMGFEMGlNamt3Y0hnaUlHaGxhV2RvZEQwaU5UQXdjSGdpSUM4K1BISmxZM1FnYzNSNWJHVTlJbVpwYkhSbGNqb2dkWEpzS0NObU1Ta2lJSGc5SWpCd2VDSWdlVDBpTUhCNElpQjNhV1IwYUQwaU1qa3djSGdpSUdobGFXZG9kRDBpTlRBd2NIZ2lJQzgrSUR4bklITjBlV3hsUFNKbWFXeDBaWEk2ZFhKc0tDTjBiM0F0Y21WbmFXOXVMV0pzZFhJcE95QjBjbUZ1YzJadmNtMDZjMk5oYkdVb01TNDFLVHNnZEhKaGJuTm1iM0p0TFc5eWFXZHBianBqWlc1MFpYSWdkRzl3T3lJK1BISmxZM1FnWm1sc2JEMGlibTl1WlNJZ2VEMGlNSEI0SWlCNVBTSXdjSGdpSUhkcFpIUm9QU0l5T1RCd2VDSWdhR1ZwWjJoMFBTSTFNREJ3ZUNJZ0x6NDhaV3hzYVhCelpTQmplRDBpTlRBbElpQmplVDBpTUhCNElpQnllRDBpTVRnd2NIZ2lJSEo1UFNJeE1qQndlQ0lnWm1sc2JEMGlJekF3TUNJZ2IzQmhZMmwwZVQwaU1DNDROU0lnTHo0OEwyYytQSEpsWTNRZ2VEMGlNQ0lnZVQwaU1DSWdkMmxrZEdnOUlqSTVNQ0lnYUdWcFoyaDBQU0kxTURBaUlISjRQU0kwTWlJZ2NuazlJalF5SWlCbWFXeHNQU0p5WjJKaEtEQXNNQ3d3TERBcElpQnpkSEp2YTJVOUluSm5ZbUVvTWpVMUxESTFOU3d5TlRVc01DNHlLU0lnTHo0OEwyYytQSFJsZUhRZ2RHVjRkQzF5Wlc1a1pYSnBibWM5SW05d2RHbHRhWHBsVTNCbFpXUWlQangwWlhoMFVHRjBhQ0J6ZEdGeWRFOW1abk5sZEQwaUxURXdNQ1VpSUdacGJHdzlJbmRvYVhSbElpQm1iMjUwTFdaaGJXbHNlVDBpSjBOdmRYSnBaWElnVG1WM0p5d2diVzl1YjNOd1lXTmxJaUJtYjI1MExYTnBlbVU5SWpFd2NIZ2lJSGhzYVc1ck9taHlaV1k5SWlOMFpYaDBMWEJoZEdndFlTSStNSGhpTkdaaVpqSTNNVEUwTTJZMFptSm1OMkk1TVdFMVpHVmtNekU0TURWbE5ESmlNakl3T0dRMklPS0FvaUJYUlZSSUlEeGhibWx0WVhSbElHRmtaR2wwYVhabFBTSnpkVzBpSUdGMGRISnBZblYwWlU1aGJXVTlJbk4wWVhKMFQyWm1jMlYwSWlCbWNtOXRQU0l3SlNJZ2RHODlJakV3TUNVaUlHSmxaMmx1UFNJd2N5SWdaSFZ5UFNJek1ITWlJSEpsY0dWaGRFTnZkVzUwUFNKcGJtUmxabWx1YVhSbElpQXZQand2ZEdWNGRGQmhkR2crSUR4MFpYaDBVR0YwYUNCemRHRnlkRTltWm5ObGREMGlNQ1VpSUdacGJHdzlJbmRvYVhSbElpQm1iMjUwTFdaaGJXbHNlVDBpSjBOdmRYSnBaWElnVG1WM0p5d2diVzl1YjNOd1lXTmxJaUJtYjI1MExYTnBlbVU5SWpFd2NIZ2lJSGhzYVc1ck9taHlaV1k5SWlOMFpYaDBMWEJoZEdndFlTSStNSGhpTkdaaVpqSTNNVEUwTTJZMFptSm1OMkk1TVdFMVpHVmtNekU0TURWbE5ESmlNakl3T0dRMklPS0FvaUJYUlZSSUlEeGhibWx0WVhSbElHRmtaR2wwYVhabFBTSnpkVzBpSUdGMGRISnBZblYwWlU1aGJXVTlJbk4wWVhKMFQyWm1jMlYwSWlCbWNtOXRQU0l3SlNJZ2RHODlJakV3TUNVaUlHSmxaMmx1UFNJd2N5SWdaSFZ5UFNJek1ITWlJSEpsY0dWaGRFTnZkVzUwUFNKcGJtUmxabWx1YVhSbElpQXZQaUE4TDNSbGVIUlFZWFJvUGp4MFpYaDBVR0YwYUNCemRHRnlkRTltWm5ObGREMGlOVEFsSWlCbWFXeHNQU0ozYUdsMFpTSWdabTl1ZEMxbVlXMXBiSGs5SWlkRGIzVnlhV1Z5SUU1bGR5Y3NJRzF2Ym05emNHRmpaU0lnWm05dWRDMXphWHBsUFNJeE1IQjRJaUI0YkdsdWF6cG9jbVZtUFNJamRHVjRkQzF3WVhSb0xXRWlQakI0TVdZNU9EUXdZVGcxWkRWaFpqVmlaakZrTVRjMk1tWTVNalZpWkdGa1pHTTBNakF4WmprNE5DRGlnS0lnVlU1SklEeGhibWx0WVhSbElHRmtaR2wwYVhabFBTSnpkVzBpSUdGMGRISnBZblYwWlU1aGJXVTlJbk4wWVhKMFQyWm1jMlYwSWlCbWNtOXRQU0l3SlNJZ2RHODlJakV3TUNVaUlHSmxaMmx1UFNJd2N5SWdaSFZ5UFNJek1ITWlJSEpsY0dWaGRFTnZkVzUwUFNKcGJtUmxabWx1YVhSbElpQXZQand2ZEdWNGRGQmhkR2crUEhSbGVIUlFZWFJvSUhOMFlYSjBUMlptYzJWMFBTSXROVEFsSWlCbWFXeHNQU0ozYUdsMFpTSWdabTl1ZEMxbVlXMXBiSGs5SWlkRGIzVnlhV1Z5SUU1bGR5Y3NJRzF2Ym05emNHRmpaU0lnWm05dWRDMXphWHBsUFNJeE1IQjRJaUI0YkdsdWF6cG9jbVZtUFNJamRHVjRkQzF3WVhSb0xXRWlQakI0TVdZNU9EUXdZVGcxWkRWaFpqVmlaakZrTVRjMk1tWTVNalZpWkdGa1pHTTBNakF4WmprNE5DRGlnS0lnVlU1SklEeGhibWx0WVhSbElHRmtaR2wwYVhabFBTSnpkVzBpSUdGMGRISnBZblYwWlU1aGJXVTlJbk4wWVhKMFQyWm1jMlYwSWlCbWNtOXRQU0l3SlNJZ2RHODlJakV3TUNVaUlHSmxaMmx1UFNJd2N5SWdaSFZ5UFNJek1ITWlJSEpsY0dWaGRFTnZkVzUwUFNKcGJtUmxabWx1YVhSbElpQXZQand2ZEdWNGRGQmhkR2crUEM5MFpYaDBQanhuSUcxaGMyczlJblZ5YkNnalptRmtaUzF6ZVcxaWIyd3BJajQ4Y21WamRDQm1hV3hzUFNKdWIyNWxJaUI0UFNJd2NIZ2lJSGs5SWpCd2VDSWdkMmxrZEdnOUlqSTVNSEI0SWlCb1pXbG5hSFE5SWpJd01IQjRJaUF2UGlBOGRHVjRkQ0I1UFNJM01IQjRJaUI0UFNJek1uQjRJaUJtYVd4c1BTSjNhR2wwWlNJZ1ptOXVkQzFtWVcxcGJIazlJaWREYjNWeWFXVnlJRTVsZHljc0lHMXZibTl6Y0dGalpTSWdabTl1ZEMxM1pXbG5hSFE5SWpJd01DSWdabTl1ZEMxemFYcGxQU0l6Tm5CNElqNVZUa2t2VjBWVVNEd3ZkR1Y0ZEQ0OGRHVjRkQ0I1UFNJeE1UVndlQ0lnZUQwaU16SndlQ0lnWm1sc2JEMGlkMmhwZEdVaUlHWnZiblF0Wm1GdGFXeDVQU0luUTI5MWNtbGxjaUJPWlhjbkxDQnRiMjV2YzNCaFkyVWlJR1p2Ym5RdGQyVnBaMmgwUFNJeU1EQWlJR1p2Ym5RdGMybDZaVDBpTXpad2VDSStNQzR6SlR3dmRHVjRkRDQ4TDJjK1BISmxZM1FnZUQwaU1UWWlJSGs5SWpFMklpQjNhV1IwYUQwaU1qVTRJaUJvWldsbmFIUTlJalEyT0NJZ2NuZzlJakkySWlCeWVUMGlNallpSUdacGJHdzlJbkpuWW1Fb01Dd3dMREFzTUNraUlITjBjbTlyWlQwaWNtZGlZU2d5TlRVc01qVTFMREkxTlN3d0xqSXBJaUF2UGp4bklHMWhjMnM5SW5WeWJDZ2pibTl1WlNraUlITjBlV3hsUFNKMGNtRnVjMlp2Y20wNmRISmhibk5zWVhSbEtEY3ljSGdzTVRnNWNIZ3BJajQ4Y21WamRDQjRQU0l0TVRad2VDSWdlVDBpTFRFMmNIZ2lJSGRwWkhSb1BTSXhPREJ3ZUNJZ2FHVnBaMmgwUFNJeE9EQndlQ0lnWm1sc2JEMGlibTl1WlNJZ0x6NDhjR0YwYUNCa1BTSk5NU0F4UXpFZ09UY2dORGtnTVRRMUlERTBOU0F4TkRVaUlITjBjbTlyWlQwaWNtZGlZU2d3TERBc01Dd3dMak1wSWlCemRISnZhMlV0ZDJsa2RHZzlJak15Y0hnaUlHWnBiR3c5SW01dmJtVWlJSE4wY205clpTMXNhVzVsWTJGd1BTSnliM1Z1WkNJZ0x6NDhMMmMrUEdjZ2JXRnphejBpZFhKc0tDTnViMjVsS1NJZ2MzUjViR1U5SW5SeVlXNXpabTl5YlRwMGNtRnVjMnhoZEdVb056SndlQ3d4T0Rsd2VDa2lQanh5WldOMElIZzlJaTB4Tm5CNElpQjVQU0l0TVRad2VDSWdkMmxrZEdnOUlqRTRNSEI0SWlCb1pXbG5hSFE5SWpFNE1IQjRJaUJtYVd4c1BTSnViMjVsSWlBdlBqeHdZWFJvSUdROUlrMHhJREZETVNBNU55QTBPU0F4TkRVZ01UUTFJREUwTlNJZ2MzUnliMnRsUFNKeVoySmhLREkxTlN3eU5UVXNNalUxTERFcElpQm1hV3hzUFNKdWIyNWxJaUJ6ZEhKdmEyVXRiR2x1WldOaGNEMGljbTkxYm1RaUlDOCtQQzluUGp4amFYSmpiR1VnWTNnOUlqY3pjSGdpSUdONVBTSXhPVEJ3ZUNJZ2NqMGlOSEI0SWlCbWFXeHNQU0ozYUdsMFpTSWdMejQ4WTJseVkyeGxJR040UFNJeU1UZHdlQ0lnWTNrOUlqTXpOSEI0SWlCeVBTSTBjSGdpSUdacGJHdzlJbmRvYVhSbElpQXZQaUE4WnlCemRIbHNaVDBpZEhKaGJuTm1iM0p0T25SeVlXNXpiR0YwWlNneU9YQjRMQ0F6T0RSd2VDa2lQanh5WldOMElIZHBaSFJvUFNJMk0zQjRJaUJvWldsbmFIUTlJakkyY0hnaUlISjRQU0k0Y0hnaUlISjVQU0k0Y0hnaUlHWnBiR3c5SW5KblltRW9NQ3d3TERBc01DNDJLU0lnTHo0OGRHVjRkQ0I0UFNJeE1uQjRJaUI1UFNJeE4zQjRJaUJtYjI1MExXWmhiV2xzZVQwaUowTnZkWEpwWlhJZ1RtVjNKeXdnYlc5dWIzTndZV05sSWlCbWIyNTBMWE5wZW1VOUlqRXljSGdpSUdacGJHdzlJbmRvYVhSbElqNDhkSE53WVc0Z1ptbHNiRDBpY21kaVlTZ3lOVFVzTWpVMUxESTFOU3d3TGpZcElqNUpSRG9nUEM5MGMzQmhiajR4UEM5MFpYaDBQand2Wno0Z1BHY2djM1I1YkdVOUluUnlZVzV6Wm05eWJUcDBjbUZ1YzJ4aGRHVW9Namx3ZUN3Z05ERTBjSGdwSWo0OGNtVmpkQ0IzYVdSMGFEMGlNVFF3Y0hnaUlHaGxhV2RvZEQwaU1qWndlQ0lnY25nOUlqaHdlQ0lnY25rOUlqaHdlQ0lnWm1sc2JEMGljbWRpWVNnd0xEQXNNQ3d3TGpZcElpQXZQangwWlhoMElIZzlJakV5Y0hnaUlIazlJakUzY0hnaUlHWnZiblF0Wm1GdGFXeDVQU0luUTI5MWNtbGxjaUJPWlhjbkxDQnRiMjV2YzNCaFkyVWlJR1p2Ym5RdGMybDZaVDBpTVRKd2VDSWdabWxzYkQwaWQyaHBkR1VpUGp4MGMzQmhiaUJtYVd4c1BTSnlaMkpoS0RJMU5Td3lOVFVzTWpVMUxEQXVOaWtpUGsxcGJpQlVhV05yT2lBOEwzUnpjR0Z1UGkwMk9UQTJNRHd2ZEdWNGRENDhMMmMrSUR4bklITjBlV3hsUFNKMGNtRnVjMlp2Y20wNmRISmhibk5zWVhSbEtESTVjSGdzSURRME5IQjRLU0krUEhKbFkzUWdkMmxrZEdnOUlqRXdOWEI0SWlCb1pXbG5hSFE5SWpJMmNIZ2lJSEo0UFNJNGNIZ2lJSEo1UFNJNGNIZ2lJR1pwYkd3OUluSm5ZbUVvTUN3d0xEQXNNQzQyS1NJZ0x6NDhkR1Y0ZENCNFBTSXhNbkI0SWlCNVBTSXhOM0I0SWlCbWIyNTBMV1poYldsc2VUMGlKME52ZFhKcFpYSWdUbVYzSnl3Z2JXOXViM053WVdObElpQm1iMjUwTFhOcGVtVTlJakV5Y0hnaUlHWnBiR3c5SW5kb2FYUmxJajQ4ZEhOd1lXNGdabWxzYkQwaWNtZGlZU2d5TlRVc01qVTFMREkxTlN3d0xqWXBJajVOWVhnZ1ZHbGphem9nUEM5MGMzQmhiajR3UEM5MFpYaDBQand2Wno0OFp5QnpkSGxzWlQwaWRISmhibk5tYjNKdE9uUnlZVzV6YkdGMFpTZ3lNalp3ZUN3Z05ETXpjSGdwSWo0OGNtVmpkQ0IzYVdSMGFEMGlNelp3ZUNJZ2FHVnBaMmgwUFNJek5uQjRJaUJ5ZUQwaU9IQjRJaUJ5ZVQwaU9IQjRJaUJtYVd4c1BTSnViMjVsSWlCemRISnZhMlU5SW5KblltRW9NalUxTERJMU5Td3lOVFVzTUM0eUtTSWdMejQ4Y0dGMGFDQnpkSEp2YTJVdGJHbHVaV05oY0QwaWNtOTFibVFpSUdROUlrMDRJRGxET0M0d01EQXdOQ0F5TWk0NU5EazBJREUyTGpJd09Ua2dNamdnTWpjZ01qZ2lJR1pwYkd3OUltNXZibVVpSUhOMGNtOXJaVDBpZDJocGRHVWlJQzgrUEdOcGNtTnNaU0J6ZEhsc1pUMGlkSEpoYm5ObWIzSnRPblJ5WVc1emJHRjBaVE5rS0Rod2VDd2dNVFF1TWpWd2VDd2dNSEI0S1NJZ1kzZzlJakJ3ZUNJZ1kzazlJakJ3ZUNJZ2NqMGlOSEI0SWlCbWFXeHNQU0ozYUdsMFpTSXZQand2Wno0OFp5QnpkSGxzWlQwaWRISmhibk5tYjNKdE9uUnlZVzV6YkdGMFpTZ3lNalp3ZUN3Z016a3ljSGdwSWo0OGNtVmpkQ0IzYVdSMGFEMGlNelp3ZUNJZ2FHVnBaMmgwUFNJek5uQjRJaUJ5ZUQwaU9IQjRJaUJ5ZVQwaU9IQjRJaUJtYVd4c1BTSnViMjVsSWlCemRISnZhMlU5SW5KblltRW9NalUxTERJMU5Td3lOVFVzTUM0eUtTSWdMejQ4Wno0OGNHRjBhQ0J6ZEhsc1pUMGlkSEpoYm5ObWIzSnRPblJ5WVc1emJHRjBaU2cyY0hnc05uQjRLU0lnWkQwaVRURXlJREJNTVRJdU5qVXlNaUE1TGpVMk5UZzNUREU0SURFdU5qQTNOMHd4TXk0M09ERTVJREV3TGpJeE9ERk1Nakl1TXpreU15QTJUREUwTGpRek5ERWdNVEV1TXpRM09Fd3lOQ0F4TWt3eE5DNDBNelF4SURFeUxqWTFNakpNTWpJdU16a3lNeUF4T0V3eE15NDNPREU1SURFekxqYzRNVGxNTVRnZ01qSXVNemt5TTB3eE1pNDJOVEl5SURFMExqUXpOREZNTVRJZ01qUk1NVEV1TXpRM09DQXhOQzQwTXpReFREWWdNakl1TXpreU0wd3hNQzR5TVRneElERXpMamM0TVRsTU1TNDJNRGMzSURFNFREa3VOVFkxT0RjZ01USXVOalV5TWt3d0lERXlURGt1TlRZMU9EY2dNVEV1TXpRM09Fd3hMall3TnpjZ05rd3hNQzR5TVRneElERXdMakl4T0RGTU5pQXhMall3TnpkTU1URXVNelEzT0NBNUxqVTJOVGczVERFeUlEQmFJaUJtYVd4c1BTSjNhR2wwWlNJZ0x6NDhZVzVwYldGMFpWUnlZVzV6Wm05eWJTQmhkSFJ5YVdKMWRHVk9ZVzFsUFNKMGNtRnVjMlp2Y20waUlIUjVjR1U5SW5KdmRHRjBaU0lnWm5KdmJUMGlNQ0F4T0NBeE9DSWdkRzg5SWpNMk1DQXhPQ0F4T0NJZ1pIVnlQU0l4TUhNaUlISmxjR1ZoZEVOdmRXNTBQU0pwYm1SbFptbHVhWFJsSWk4K1BDOW5Qand2Wno0OEwzTjJaejQ9In0=',
  ]
  return useMemo(() => {
    if (error || !valid || !tokenId) {
      return {
        valid: false,
        loading: false,
      }
    }
    if (loading) {
      return {
        valid: true,
        loading: true,
      }
    }
    if (!result) {
      return {
        valid: false,
        loading: false,
      }
    }
    const [tokenURI] = result as [string]
    if (!tokenURI || !tokenURI.startsWith(STARTS_WITH))
      return {
        valid: false,
        loading: false,
      }

    try {
      const json = JSON.parse(atob(tokenURI.slice(STARTS_WITH.length)))

      return {
        valid: true,
        loading: false,
        result: json,
      }
    } catch (error) {
      return { valid: false, loading: false }
    }
  }, [error, loading, result, tokenId, valid])
}
