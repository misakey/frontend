module.exports = (theme) => ({
  Logo: {
    // We're changing the LogoRenderer component
    logo: {
      // We're changing the rsg--logo-XX class name inside the component
      color: theme.color.logo,
    },
  },
  TableOfContents: {
    input: {
      background: theme.color.sidebarBackground,
      color: theme.color.searchText,
      '&::placeholder': {
        color: theme.color.searchText,
      },
    },
  },
});
