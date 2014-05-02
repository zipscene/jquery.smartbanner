jQuery Smart Banner
===================

[Smart Banners][1] are a new feature in iOS 6 to promote apps on the App Store from a website. This jQuery plugin
brings this feature to older iOS versions, Android devices and for Windows Store apps.

## Usage ##
		<html>
			<head>
				<title>YouTube</title>
				<meta name="author" content="Google, Inc.">
				<meta name="apple-itunes-app" content="app-id=[app-id]">
				<meta name="apple-itunes-app-tab" content="app-id=[app-id]">
				<meta name="google-play-app" content="app-id=[app-id]">
				<meta name="google-play-app-tab" content="app-id=[app-id]">
				<meta name="msApplication-ID" content="App" />
				<meta name="msApplication-TileImage" content="http://wscont1.apps.microsoft.com/winstore/1x/107a0080-d451-4367-bee0-ccbb49465360/Icon.102051.png" /> <!-- From the Windows RT store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
				<meta name="msApplication-PackageFamilyName" content="9E2F88E3.Twitter_wgeqdkkx372wm" /> <!-- Windows RT > PackageFamilyName is visible in the source page of the store : http://apps.microsoft.com/windows/fr-fr/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35 -->
				<meta name="msApplication-WinPhonePackageUrl" content="app-id=0b792c7c-14dc-df11-a844-00237de2db9e" /> <!-- Windows Phone > AppId is visible in the URL of the app in the windows phone store -->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link rel="stylesheet" href="jquery.smartbanner.css" type="text/css" media="screen">
				<link rel="apple-touch-icon" href="apple-touch-icon.png">
			</head>
			<body>
				...
				<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
				<script src="jquery.smartbanner.js"></script>
				<script type="text/javascript">
					$(function() { $.smartbanner({ /* options */ }) } );
				</script>
			</body>
		</html>

## Options ##
		$.smartbanner({
			title: null, // What the title of the app should be in the banner (defaults to <title>)
			author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
			price: 'FREE', // Price of the app
			appStoreLanguage: 'us', // Language code for App Store
			inAppStore: 'On the App Store', // Text of price for iOS
			inGooglePlay: 'In Google Play', // Text of price for Android
			inWindowsStore: 'In the Windows Store', // Text of price for Windows
			icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
			iconGloss: null, // Force gloss effect for iOS even for precomposed
			url: null, // The URL for the button. Keep null if you want the button to link to the app store.
			button: 'INSTALL', // Text for the install button
			scale: 'auto', // Scale based on viewport size (set to 1 to disable)
			speedIn: 300, // Show animation speed of the banner
			speedOut: 400, // Close animation speed of the banner
			daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner, null = show banner on each browser session)
			daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
			force: null, // Choose 'ios', 'android' or 'windows'. Don't do a browser check, just always show this banner
			container: 'body' // Container where the banner will be injected
		})

[1]: http://developer.apple.com/library/ios/#documentation/AppleApplications/Reference/SafariWebContent/PromotingAppswithAppBanners/PromotingAppswithAppBanners.html
