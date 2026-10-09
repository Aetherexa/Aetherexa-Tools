import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
interface Props { children: ReactNode; }
interface State { failed: boolean; }
/** Keep one tool failure from presenting a blank interactive area. */
export default class ToolErrorBoundary extends Component<Props, State> {
  state: State = {failed: false};
  static getDerivedStateFromError(): State { return {failed:true}; }
  componentDidCatch(_error: Error, _info: ErrorInfo): void { /* Do not log user inputs. */ }
  render() {
    if (this.state.failed) return <section className="panel" role="alert"><h2>Something went wrong in this tool.</h2><p className="muted">Your data was not sent to a server. Reload to restart the tool, or return to the tool catalog.</p><div className="action-row"><button type="button" className="btn primary" onClick={()=>window.location.reload()}>Reload tool</button><a href="/#tools" className="btn ghost">Browse tools</a></div></section>;
    return this.props.children;
  }
}
