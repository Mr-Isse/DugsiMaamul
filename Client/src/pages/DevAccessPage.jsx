import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { setCredentials } from '@/store/slices/authSlice'
import { setTenant } from '@/store/slices/tenantSlice'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

/**
 * Dev-only helper to enter protected routes during foundation verification.
 * Remove or gate behind VITE flags when auth API is wired.
 */
export function DevAccessPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Dev access · DugsiMaamul'
  }, [])

  function enterShell() {
    dispatch(
      setCredentials({
        accessToken: 'dev-foundation-token',
        user: {
          _id: '000000000000000000000001',
          name: 'Foundation User',
          email: 'foundation@dugsimaamul.local',
          role: 'school_admin',
          permissions: ['*'],
        },
        permissions: ['*'],
        roles: ['school_admin'],
      })
    )
    dispatch(
      setTenant({
        tenantId: 'demo',
        subdomain: 'demo',
        school: { name: 'Demo School' },
      })
    )
    navigate('/app')
  }

  if (!import.meta.env.DEV) {
    return <Outlet />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foundation access</CardTitle>
        <CardDescription>
          Temporary local helper to verify protected routing. Not for
          production.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={enterShell}>Enter app shell (dev)</Button>
      </CardContent>
    </Card>
  )
}
