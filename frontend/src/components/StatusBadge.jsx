const StatusBadge = ({ status }) => {
    const cls = {
        Draft: 'badge-draft',
        Submitted: 'badge-submitted',
        Approved: 'badge-approved',
        Rejected: 'badge-rejected',
    }[status] || 'badge-draft';

    return <span className={`badge ${cls}`}>{status}</span>;
};

export default StatusBadge;
