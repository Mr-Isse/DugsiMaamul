import React, { useMemo, useState } from 'react';
import { Bus, Plus, Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateTransportRouteMutation, useCreateTransportVehicleMutation, useGetTransportRoutesQuery, useGetTransportVehiclesQuery } from '../store/adminApiSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { PageLayout, PageHeader, ContentCard } from '../components/PageLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/Dialog';

const initialRoute = { title: '', fare: '', status: 'Active', stops: '' };
const initialVehicle = { vehicleNumber: '', model: '', capacity: '', driverName: '', driverPhone: '', status: 'Active' };

function TransportManagement() {
  const { data: routesPayload, isLoading: loadingRoutes, refetch: refetchRoutes } = useGetTransportRoutesQuery();
  const { data: vehiclesPayload, isLoading: loadingVehicles, refetch: refetchVehicles } = useGetTransportVehiclesQuery();
  const [createRoute, { isLoading: savingRoute }] = useCreateTransportRouteMutation();
  const [createVehicle, { isLoading: savingVehicle }] = useCreateTransportVehicleMutation();

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [routeForm, setRouteForm] = useState(initialRoute);
  const [vehicleForm, setVehicleForm] = useState(initialVehicle);

  const routes = useMemo(() => {
    if (Array.isArray(routesPayload?.data)) return routesPayload.data;
    if (Array.isArray(routesPayload)) return routesPayload;
    return [];
  }, [routesPayload]);

  const vehicles = useMemo(() => {
    if (Array.isArray(vehiclesPayload?.data)) return vehiclesPayload.data;
    if (Array.isArray(vehiclesPayload)) return vehiclesPayload;
    return [];
  }, [vehiclesPayload]);

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const stops = routeForm.stops.split(',').map((stop) => ({ name: stop.trim(), time: '' })).filter(Boolean);
      await createRoute({ title: routeForm.title, fare: Number(routeForm.fare || 0), status: routeForm.status, stops }).unwrap();
      toast.success('Transport route saved');
      setShowRouteModal(false);
      setRouteForm(initialRoute);
      refetchRoutes();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save route');
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await createVehicle({ ...vehicleForm, capacity: Number(vehicleForm.capacity || 0) }).unwrap();
      toast.success('Vehicle saved');
      setShowVehicleModal(false);
      setVehicleForm(initialVehicle);
      refetchVehicles();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save vehicle');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Transport Management"
        description="Coordinate routes, buses, and drivers"
        icon={Bus}
        actions={
          <>
            <Button onClick={() => setShowRouteModal(true)} className="gap-2">
              <Plus size={16} />
              Add Route
            </Button>
            <Button onClick={() => setShowVehicleModal(true)} className="gap-2">
              <Truck size={16} />
              Add Vehicle
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard padding={false}>
          <div className="border-b border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Routes</h2>
          </div>
          {loadingRoutes ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
          ) : routes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No routes available yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {routes.map((route) => (
                <div key={route._id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{route.title}</p>
                      <p className="text-sm text-slate-500">{route.stops?.length || 0} stop(s)</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{route.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Fare: ${Number(route.fare || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </ContentCard>

        <ContentCard padding={false}>
          <div className="border-b border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Vehicles</h2>
          </div>
          {loadingVehicles ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
          ) : vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No vehicles available yet.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {vehicles.map((vehicle) => (
                <div key={vehicle._id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{vehicle.vehicleNumber}</p>
                      <p className="text-sm text-slate-500">{vehicle.model || 'Vehicle model pending'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">{vehicle.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Driver: {vehicle.driverName || 'Unassigned'} &bull; Capacity: {vehicle.capacity}</p>
                </div>
              ))}
            </div>
          )}
        </ContentCard>
      </div>

      <Dialog open={showRouteModal} onOpenChange={setShowRouteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Route</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoute} className="space-y-4">
            <Input required value={routeForm.title} onChange={(e) => setRouteForm({ ...routeForm, title: e.target.value })} placeholder="Route title" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="number" min="0" value={routeForm.fare} onChange={(e) => setRouteForm({ ...routeForm, fare: e.target.value })} placeholder="Fare" />
              <select value={routeForm.status} onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <textarea value={routeForm.stops} onChange={(e) => setRouteForm({ ...routeForm, stops: e.target.value })} rows="3" placeholder="Stop names separated by commas" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRouteModal(false)}>Cancel</Button>
              <Button type="submit" disabled={savingRoute}>{savingRoute ? <Loader2 className="animate-spin" size={18} /> : 'Save Route'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showVehicleModal} onOpenChange={setShowVehicleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateVehicle} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input required value={vehicleForm.vehicleNumber} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} placeholder="Vehicle number" />
              <Input value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="Model" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="number" min="1" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} placeholder="Capacity" />
              <select value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input value={vehicleForm.driverName} onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })} placeholder="Driver name" />
              <Input value={vehicleForm.driverPhone} onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })} placeholder="Driver phone" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
              <Button type="submit" disabled={savingVehicle}>{savingVehicle ? <Loader2 className="animate-spin" size={18} /> : 'Save Vehicle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

export default TransportManagement;
