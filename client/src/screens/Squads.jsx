import { useApp } from '../AppContext.jsx';
import { api } from '../api.js';
import { useFetch } from '../lib.js';
import { Screen, SquadCard, Icon, Loading, ErrorState } from '../components/ui.jsx';

export default function Squads() {
  const { nav } = useApp();
  const { data, error, reload } = useFetch(api.squads);

  return (
    <Screen title="Squads" action={<button className="btn sm" onClick={() => nav.go('newSquad')}>{Icon.plus} New</button>}>
      <div className="card green">
        <div className="bold">Save for plans with your people</div>
        <div className="small mt4">Trips, flat deposits, gifts, gigs. Everyone invests their own share, and the money grows until the plan happens.</div>
      </div>

      <div className="h2">Active squads</div>
      {error ? <ErrorState message={error} onRetry={reload} />
        : !data ? <Loading />
        : data.length ? data.map(sq => <SquadCard key={sq.id} squad={sq} />)
        : <div className="empty">No squads yet</div>}

      <div className="h2">How it works</div>
      <div className="card soft small">
        <div className="row" style={{ alignItems: 'flex-start' }}><b className="pos">1</b><div>Set a goal and a date. We pick a fund that suits the timeline.</div></div>
        <div className="row mt8" style={{ alignItems: 'flex-start' }}><b className="pos">2</b><div>Invite friends. Each person invests from their own account.</div></div>
        <div className="row mt8" style={{ alignItems: 'flex-start' }}><b className="pos">3</b><div>Track progress together. Your share is always yours, even if you leave.</div></div>
      </div>
    </Screen>
  );
}
