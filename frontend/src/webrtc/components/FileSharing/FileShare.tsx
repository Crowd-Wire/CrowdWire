import React from 'react';
import { FileList } from './FileList';
import FileSharingModerator from './FileSharingModerator';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) =>
	({
		root :
		{
			display       : 'flex',
			flexDirection : 'column',
			width         : '100%',
			height        : '100%'
		},
		input :
		{
			display : 'none'
		},
		button :
		{
			margin : theme.spacing(1)
		},
		shareButtonsWrapper :
		{
			display : 'flex'
		}
	})
)

export const FileSharing: React.FC<{}> = ({
}) => {
  const classes = useStyles();

	const intl = useIntl();

	const handleFileChange = async (event) =>
	{
		if (event.target.files.length > 0)
		{
			await props.roomClient.shareFiles(event.target.files);
		}
	};

	const {
		canShareFiles,
		browser,
		canShare,
		classes
	} = props;

	const buttonDescription = canShareFiles ?
		intl.formatMessage({
			id             : 'label.shareFile',
			defaultMessage : 'Share file'
		})
		:
		intl.formatMessage({
			id             : 'label.fileSharingUnsupported',
			defaultMessage : 'File sharing not supported'
		});

	const buttonGalleryDescription = canShareFiles ?
		intl.formatMessage({
			id             : 'label.shareGalleryFile',
			defaultMessage : 'Share image'
		})
		:
		intl.formatMessage({
			id             : 'label.fileSharingUnsupported',
			defaultMessage : 'File sharing not supported'
		});

	return (
		<Paper className={classes.root}>
			<FileSharingModerator />
			<div className={classes.shareButtonsWrapper} >
				<input
					className={classes.input}
					type='file'
					disabled={!canShare}
					onChange={handleFileChange}
					// Need to reset to be able to share same file twice
					onClick={(e) => (e.target.value = null)}
					id='share-files-button'
				/>
				<input
					className={classes.input}
					type='file'
					disabled={!canShare}
					onChange={handleFileChange}
					accept='image/*'
					id='share-files-gallery-button'
				/>
				<label htmlFor='share-files-button'>
					<Button
						variant='contained'
						component='span'
						className={classes.button}
						disabled={!canShareFiles || !canShare}
					>
						{buttonDescription}
					</Button>
				</label>
				{
					(browser.platform === 'mobile') && canShareFiles && canShare && <label htmlFor='share-files-gallery-button'>
						<Button
							variant='contained'
							component='span'
							className={classes.button}
							disabled={!canShareFiles || !canShare}
						>
							{buttonGalleryDescription}
						</Button>
					</label>
				}
			</div>
			<FileList />
		</Paper>
	);
};