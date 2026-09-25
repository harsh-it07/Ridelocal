import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";

function fileUrl(fileRef: string): string {
  if (!fileRef) return "";
  if (fileRef.startsWith("http")) return fileRef;
  const path = fileRef.replace("local://", "");
  return `/api/uploads/file/${path}`;
}

export function VehicleApprovalPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function load() {
    api
      .get("/admin/vehicles/pending")
      .then(({ data }) => setVehicles(data.vehicles))
      .catch((err) => setError(getErrorMessage(err)));
  }

  useEffect(load, []);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api.patch(`/admin/vehicles/${id}/approve`, { approve });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Vehicle approvals</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-5 space-y-3">
        {vehicles.map((v) => {
          const isExpanded = expandedId === v.id;
          return (
          <div key={v.id} className={`card p-4 transition-all duration-300 ${isExpanded ? 'bg-neutral-50/5' : ''}`}>
            <div className="flex items-start justify-between cursor-pointer group" onClick={() => setExpandedId(isExpanded ? null : v.id)}>
              <div className="flex-1">
                <p className="font-semibold text-ink-900 group-hover:text-brand-600 transition-colors">
                  {v.brand} {v.model} ({v.vehicleType})
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  Owner: {v.owner?.name} ({v.owner?.email}) — owner verification:{" "}
                  <span className={v.owner?.verificationStatus === 'VERIFIED' ? 'text-green-500 font-medium' : 'text-orange-400 font-medium'}>
                    {v.owner?.verificationStatus}
                  </span>
                </p>
                <p className="text-sm text-ink-500">
                  ₹{v.pricePerDay}/day · {v.city} · Reg: {v.registrationReference}
                </p>
                {v.documents?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    {v.documents.map((d: any) => (
                      <a
                        key={d.id}
                        href={fileUrl(d.secureFileReference)}
                        target="_blank"
                        rel="noreferrer"
                        className="chip !py-1 text-xs hover:bg-white/10"
                      >
                        {d.documentType.replace(/_/g, " ").toLowerCase()}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 ml-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  <button
                    disabled={busyId === v.id}
                    onClick={() => decide(v.id, true)}
                    className="btn-primary !py-1.5 !px-3 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busyId === v.id}
                    onClick={() => decide(v.id, false)}
                    className="btn-danger !py-1.5 !px-3 text-sm"
                  >
                    Reject
                  </button>
                </div>
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="text-xs font-medium text-brand-600 hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {isExpanded && (
              <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {v.photoUrls && v.photoUrls.length > 0 ? (
                   <div className="space-y-2">
                     <img 
                       src={fileUrl(v.photoUrls[0])} 
                       alt={v.model} 
                       className="w-full h-48 object-cover rounded-xl border border-white/10" 
                       onError={(e) => { e.currentTarget.style.display = 'none'; }}
                     />
                     {v.photoUrls.length > 1 && (
                       <div className="flex gap-2 overflow-x-auto pb-2">
                         {v.photoUrls.slice(1).map((url: string, idx: number) => (
                           <img 
                             key={idx} 
                             src={fileUrl(url)} 
                             alt={`${v.model} ${idx + 2}`} 
                             className="w-16 h-16 object-cover rounded-lg border border-white/10 shrink-0" 
                             onError={(e) => { e.currentTarget.style.display = 'none'; }}
                           />
                         ))}
                       </div>
                     )}
                   </div>
                ) : (
                   <div className="w-full h-48 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-ink-500 text-sm">
                     No photos provided
                   </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Pricing</h4>
                    <p className="text-sm text-ink-900">
                      ₹{v.pricePerDay}/day <span className="text-ink-500 mx-2">|</span> Security Deposit: ₹{v.securityDeposit}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Location</h4>
                    <p className="text-sm text-ink-900">{v.city}</p>
                    <p className="text-xs text-ink-500 mt-1 font-mono">Lat: {v.latitude}, Lng: {v.longitude}</p>
                  </div>
                  
                  {v.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-ink-900 whitespace-pre-wrap">{v.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          );
        })}
        {vehicles.length === 0 && <p className="text-ink-500">No vehicles pending review.</p>}
      </div>
    </div>
  );
}
