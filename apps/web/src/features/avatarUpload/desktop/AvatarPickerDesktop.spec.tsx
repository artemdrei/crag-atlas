import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';
import { createAppTheme } from '@web/shared/theme/theme';

import { AvatarPickerDesktop } from './AvatarPickerDesktop';

const actions = {
  hasPhoto: false,
  isPending: false,
  remove: vi.fn()
};

const openModal = vi.fn();

vi.mock('../common', () => ({
  isSupportedPhoto: (file: File) => file.type.startsWith('image/'),
  useAvatarActions: () => actions
}));

vi.mock('@web/app/providers', () => ({ useModal: () => ({ openModal }) }));

i18n.load('en', {});
i18n.activate('en');

const renderPicker = () =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={createAppTheme('light')}>
        <AvatarPickerDesktop name="Crag Atlas" />
      </ThemeProvider>
    </I18nProvider>
  );

describe('AvatarPickerDesktop', () => {
  beforeEach(() => {
    actions.hasPhoto = false;
    actions.remove.mockClear();
    openModal.mockClear();
  });

  it('sends the chosen file to the cropper rather than straight up', () => {
    renderPicker();

    const file = new File(['x'], 'face.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('Choose a photo');

    fireEvent.change(input, { target: { files: [file] } });

    expect(openModal).toHaveBeenCalledWith('CROP_AVATAR', { file });
  });

  it('refuses anything that is not an image before the cropper', () => {
    renderPicker();

    fireEvent.change(screen.getByLabelText('Choose a photo'), {
      target: {
        files: [new File(['x'], 'topo.pdf', { type: 'application/pdf' })]
      }
    });

    expect(openModal).not.toHaveBeenCalled();
  });

  it('offers removal only once there is a photo to remove', () => {
    renderPicker();

    expect(screen.queryByLabelText('Remove your photo')).toBeNull();

    actions.hasPhoto = true;
    renderPicker();

    fireEvent.click(screen.getByLabelText('Remove your photo'));

    expect(actions.remove).toHaveBeenCalled();
  });
});
