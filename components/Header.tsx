import { useState } from 'react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Link,
  Button,
  Menu,
  MenuList,
  MenuItem,
  Typography,
  IconButton,
  MenuProps,
  Backdrop,
  SvgIcon,
} from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import { styled } from '@mui/material/styles'
import { Language as LanguageIcon, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { EXPLORER_TITLE } from 'utils'
import Logo from './Logo'
import CloseIcon from '../assets/icons/close.svg'
import MobileMenuIcon from '../assets/icons/mobile-menu.svg'
import { usePopupState, bindHover, bindMenu } from 'material-ui-popup-state/hooks'
import HoverMenu from 'material-ui-popup-state/HoverMenu'

const CHAIN_LINKS = [
  { label: 'mainnet_v1', href: 'https://v1.gwscan.com' },
  { label: 'testnet_v1', href: 'https://v1.testnet.gwscan.com' },
  { label: 'mainnet_v0', href: 'https://gwscan.com' },
  { label: 'testnet_v0', href: 'https://pudge.gwscan.com' },
]
const TOKEN_TYPE_LIST = ['bridge', 'native']
const LOCALE_LIST = ['zh-CN', 'en-US']

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  () => ({
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
  }),
)

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<KeyboardArrowDown color="secondary" sx={{ ml: '2px', fontSize: 32 }} />}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiAccordionSummary-content.Mui-expanded': {
    color: theme.palette.primary.main,
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    'transform': 'rotate(180deg)',
    '& svg': {
      color: theme.palette.primary.main,
    },
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  'padding': `0 ${theme.spacing(1)}`,
  '& .MuiList-root': {
    'padding': 0,
    '& a': {
      fontSize: '0.9rem',
    },
  },
}))

const StyledMenu = styled((props: MenuProps) => <HoverMenu {...props} />)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.spacing(1),
    boxShadow: `0px 4px 9px ${theme.palette.primary.light}`,
  },
  '& .MuiMenuItem-root': {
    '& :hover': {
      color: theme.palette.primary.main,
    },
    '& a': {
      color: theme.palette.secondary.main,
    },
  },
}))

const MobileMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorReference="anchorEl"
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    'width': '100%',
    'maxWidth': '100%',
    'maxHeight': 750,
    'left': '0 !important',
    'borderRadius': 0,
    'border': 'none',
    'backgroundColor': theme.palette.primary.light,
    '& .MuiMenu-list': {
      padding: '12px 0 4px 0',
      width: '100%',
    },
  },
}))

const Header = () => {
  const [t, { language }] = useTranslation('common')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState<string | false>('')

  const anchorElLabel = anchorEl?.getAttribute('aria-label')
  const { asPath } = useRouter()
  const isHome = asPath === '/' || asPath === '/zh-CN'
  const CHAIN_TYPE_LIST = ['mainnet', 'testnet']

  const tokenPopover = usePopupState({
    variant: 'popover',
    popupId: 'tokenPopover',
  })
  const chainPopover = usePopupState({
    variant: 'popover',
    popupId: 'chainPopover',
  })
  const languagePopover = usePopupState({
    variant: 'popover',
    popupId: 'languagePopover',
  })

  const handleMobileMenuChange = (panel: string) => (_: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  const handleMenuListOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }
  const handleMenuListClose = () => {
    setExpanded(false)
    setAnchorEl(null)
  }

  const TokenMenuItems = ({ dense }) => (
    <MenuList dense={dense} onClick={tokenPopover.close}>
      {TOKEN_TYPE_LIST.map(type => (
        <MenuItem key={type} onClick={handleMenuListClose} sx={{ p: 0 }}>
          <NextLink href={`/tokens/${type}`} passHref>
            <Link
              href={`/tokens/${type}`}
              title={t(`${type}-udt`)}
              underline="none"
              sx={{ width: '100%', padding: '6px 16px' }}
              color="secondary"
            >
              {t(`${type}-udt`)}
            </Link>
          </NextLink>
        </MenuItem>
      ))}
    </MenuList>
  )

  const ChainMenuItems = ({ dense }) => (
    <MenuList dense={dense} onClick={chainPopover.close}>
      {CHAIN_LINKS.map(chain => {
        const url = `${chain.href}/${language}`
        const [label, version] = chain.label.split('_')
        return (
          <MenuItem key={chain.label} onClick={handleMenuListClose} sx={{ p: 0 }}>
            <NextLink href={url} passHref>
              <Link
                href={url}
                title={`${t(label)} ${version}`}
                underline="none"
                justifyContent="space-between"
                sx={{ width: '100%', padding: '6px 16px' }}
                color="secondary"
              >
                <span>{t(label)}</span>
                <span>{version}</span>
              </Link>
            </NextLink>
          </MenuItem>
        )
      })}
    </MenuList>
  )

  const LocaleMenuItems = ({ dense }) => (
    <MenuList dense={dense} onClick={languagePopover.close}>
      {LOCALE_LIST.map(locale => (
        <MenuItem key={locale} onClick={handleMenuListClose} sx={{ p: 0 }}>
          <NextLink href={asPath} locale={locale} passHref>
            <Link title={t(locale)} underline="none" sx={{ width: '100%', padding: '6px 16px' }} color="secondary">
              {t(locale)}
            </Link>
          </NextLink>
        </MenuItem>
      ))}
    </MenuList>
  )

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: isHome || anchorElLabel === 'mobile-menu' ? 'primary.light' : '#F8F8FB',
        boxShadow: {
          sm: isHome
            ? 'none'
            : process.env.NEXT_PUBLIC_CHAIN_TYPE !== 'mainnet'
            ? 'none'
            : '0px 1px 2px rgba(0, 0, 0, 0.05)',
          xs: 'none',
        },
      }}
    >
      <Container sx={{ px: { md: 3, lg: 1 } }}>
        <Toolbar sx={{ flexGrow: 1 }} disableGutters>
          <NextLink href="/" passHref>
            <Link
              href="/"
              title={EXPLORER_TITLE}
              underline="none"
              mr="auto"
              display="flex"
              sx={{
                alignItems: {
                  xs: 'end',
                  sm: 'center',
                },
              }}
            >
              <Logo id="logo" color="primary" />
            </Link>
          </NextLink>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              aria-label="home"
              disableRipple
              sx={{
                'textTransform': 'none',
                'mx': 2,
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              <NextLink href={`/`} passHref>
                <Link href={`/`} title={t(`home`)} underline="none" color="secondary">
                  {t(`home`)}
                </Link>
              </NextLink>
            </Button>
            <Button
              color="secondary"
              disableRipple
              sx={{
                'textTransform': 'none',
                'mx': 2,
                '& .MuiButton-endIcon': { m: 0 },
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
              endIcon={tokenPopover.isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              {...bindHover(tokenPopover)}
            >
              {t(`token`)}
            </Button>
            <StyledMenu id="token-list" sx={{ display: { xs: 'none', md: 'block' } }} {...bindMenu(tokenPopover)}>
              <TokenMenuItems dense />
            </StyledMenu>
            <Button
              color="secondary"
              disableRipple
              sx={{
                'textTransform': 'none',
                'mx': 2,
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              <NextLink href={`/contracts`} passHref>
                <Link href={`/contracts`} title={t(`contracts`)} underline="none" color="secondary">
                  {t(`contracts`)}
                </Link>
              </NextLink>
            </Button>
            <Button
              color="secondary"
              disableRipple
              sx={{
                'textTransform': 'none',
                'mx': 2,
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              <NextLink href={`/charts`} passHref>
                <Link href={`/charts`} title={t(`charts`)} underline="none" color="secondary">
                  {t(`charts`)}
                </Link>
              </NextLink>
            </Button>
            <Button
              color="secondary"
              disableRipple
              sx={{
                'textTransform': 'none',
                'mx': 2,
                '& .MuiButton-endIcon': { m: 0 },
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
              endIcon={chainPopover.isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              {...bindHover(chainPopover)}
            >
              {t(process.env.NEXT_PUBLIC_CHAIN_TYPE || CHAIN_TYPE_LIST[1])}
            </Button>
            <StyledMenu id="chain-type" sx={{ display: { xs: 'none', md: 'block' } }} {...bindMenu(chainPopover)}>
              <ChainMenuItems dense />
            </StyledMenu>
            <Button
              color="secondary"
              disableRipple
              sx={{
                'textTransform': 'none',
                'ml': 2,
                '& [class^=MuiButton-]': { ml: 0, mr: 0.5 },
                'pr': 0,
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
              startIcon={<LanguageIcon fontSize="small" />}
              endIcon={languagePopover.isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
              {...bindHover(languagePopover)}
            >
              {language === 'zh-CN' ? '中文' : 'Eng'}
            </Button>
            <StyledMenu id="i18n" sx={{ display: { xs: 'none', md: 'block' } }} {...bindMenu(languagePopover)}>
              <LocaleMenuItems dense />
            </StyledMenu>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              aria-label="mobile-menu"
              size="small"
              aria-haspopup="true"
              onClick={handleMenuListOpen}
              color="primary"
              disableRipple
              sx={{ p: 0 }}
            >
              {anchorElLabel === 'mobile-menu' ? (
                <SvgIcon component={CloseIcon} />
              ) : (
                <SvgIcon component={MobileMenuIcon} />
              )}
            </IconButton>
            <Backdrop
              sx={{ zIndex: theme => theme.zIndex.drawer + 1, top: 56 }}
              open={anchorElLabel === 'mobile-menu'}
            />
            <MobileMenu
              id="mobile-menu"
              anchorEl={anchorEl}
              open={anchorElLabel === 'mobile-menu'}
              onClose={handleMenuListClose}
              MenuListProps={{ 'aria-labelledby': 'mobile-menu' }}
              sx={{
                textTransform: 'capitalize',
                display: { xs: 'block', md: 'none' },
              }}
              transitionDuration={400}
              autoFocus={false}
            >
              <MenuItem>
                <NextLink href={`/`} passHref>
                  <Link href={`/`} title={t(`home`)} underline="none">
                    <Typography
                      variant="body1"
                      textAlign="left"
                      color={isHome ? 'primary' : 'secondary'}
                      sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' }, py: '6px' }}
                    >
                      {t(`home`)}
                    </Typography>
                  </Link>
                </NextLink>
              </MenuItem>
              <Accordion expanded={expanded === 'token'} onChange={handleMobileMenuChange('token')}>
                <AccordionSummary aria-controls="token-content" id="token-header">
                  <Typography>{t(`token`)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TokenMenuItems dense={false} />
                </AccordionDetails>
              </Accordion>
              <MenuItem>
                <NextLink href={`/contracts`} passHref>
                  <Link href={`/contracts`} title={t(`contracts`)} underline="none">
                    <Typography
                      variant="body1"
                      textAlign="left"
                      color={asPath.startsWith('/contracts') ? 'primary' : 'secondary'}
                      sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' }, py: '6px' }}
                    >
                      {t(`contracts`)}
                    </Typography>
                  </Link>
                </NextLink>
              </MenuItem>
              <MenuItem>
                <NextLink href={`/charts`} passHref>
                  <Link href={`/charts`} title={t(`charts`)} underline="none">
                    <Typography
                      variant="body1"
                      textAlign="left"
                      color={asPath.startsWith('/charts') ? 'primary' : 'secondary'}
                      sx={{ display: { xs: 'block', md: 'none', pointerEvents: 'none' }, py: '6px' }}
                    >
                      {t(`charts`)}
                    </Typography>
                  </Link>
                </NextLink>
              </MenuItem>
              <Accordion expanded={expanded === 'chainType'} onChange={handleMobileMenuChange('chainType')}>
                <AccordionSummary aria-controls="chainType-content" id="chainType-header">
                  <Typography>{t(`chainType`)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ChainMenuItems dense={false} />
                </AccordionDetails>
              </Accordion>
              <Accordion expanded={expanded === 'language'} onChange={handleMobileMenuChange('language')}>
                <AccordionSummary aria-controls="language-content" id="language-header">
                  <Typography>{t(`language`)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <LocaleMenuItems dense={false} />
                </AccordionDetails>
              </Accordion>
            </MobileMenu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
