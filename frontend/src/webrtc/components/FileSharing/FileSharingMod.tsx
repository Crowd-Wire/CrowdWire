import React from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) =>
	({
		root :
		{
			display         : 'flex',
			padding         : theme.spacing(1),
			boxShadow       : '0 2px 5px 2px rgba(0, 0, 0, 0.2)',
			backgroundColor : 'rgba(255, 255, 255, 1)'
		},
		list_header :
		{
			padding    : theme.spacing(1),
			fontWeight : 'bolder'
		},
		actionButton :
		{
			marginLeft : 'auto'
		}
	})
)


export const FileSharingModerator: React.FC<{}> = ({

}) => {
  const classes = useStyles();

	const intl = useIntl();

	if (!isFileSharingModerator)
		return null;

	return (
		<ul className={classes.root}>
			<li className={classes.list_header}>
				<FormattedMessage
					id='room.moderatoractions'
					defaultMessage='Moderator actions'
				/>
			</li>
			<Button
				aria-label={intl.formatMessage({
					id             : 'room.clearFileSharing',
					defaultMessage : 'Clear files'
				})}
				className={classes.actionButton}
				variant='contained'
				color='secondary'
				disabled={room.clearFileSharingInProgress}
				onClick={() => roomClient.clearFileSharing()}
			>
				<FormattedMessage
					id='room.clearFileSharing'
					defaultMessage='Clear files'
				/>
			</Button>
		</ul>
	);
};