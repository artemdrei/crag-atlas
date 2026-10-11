import { Plural } from '@lingui/react/macro';
import Typography from '@mui/material/Typography';

export interface Props {
  total?: number;
}

export const VideoCount = ({ total }: Props) => {
  if (total === undefined) return null;

  return (
    <Typography variant="body2" color="text.secondary">
      <Plural
        value={total}
        one="# video"
        few="# videos"
        many="# videos"
        other="# videos"
      />
    </Typography>
  );
};
