# Network Monitoring Service (NMS) Dashboard

A modern, responsive dashboard for monitoring network infrastructure built with React, TypeScript, Tailwind CSS, and NextUI.

## Features

- 🎨 **Modern UI**: Beautiful and responsive design with dark mode support
- 📊 **Real-time Metrics**: Display key network metrics and device status
- 🔍 **Device Monitoring**: Comprehensive device status table with CPU and memory usage
- 🚨 **Alert System**: Visual indicators for system health and alerts
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode**: Built-in dark mode support for better user experience

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **NextUI** for UI components
- **Heroicons** for icons
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   └── Dashboard.tsx          # Main dashboard component
├── data/
│   └── mockData.ts           # Mock data for development
├── App.tsx                   # Main app component
├── index.tsx                 # App entry point
└── index.css                 # Global styles and Tailwind imports
```

## Dashboard Features

### Key Metrics
- **Total Devices**: Number of monitored network devices
- **Network Uptime**: Overall network availability percentage
- **Active Alerts**: Current number of system alerts
- **CPU Usage**: Average CPU utilization across devices

### Device Status Table
- Real-time device status (Online/Offline/Warning)
- IP address information
- CPU and memory usage with visual progress bars
- Last seen timestamps
- Device type categorization

### Navigation
- Sidebar navigation with different sections
- Responsive design that adapts to screen size
- Clean and intuitive user interface

## Mock Data

The dashboard currently uses mock data to simulate a real network monitoring environment. The mock data includes:

- 24 total devices
- Various device types (Routers, Switches, Servers, etc.)
- Realistic IP addresses and performance metrics
- Different status states for testing

## Customization

### Adding New Metrics
1. Update the `MockData` interface in `src/data/mockData.ts`
2. Add the new metric to the mock data
3. Create a new metric card in the Dashboard component

### Styling
- Custom CSS classes are defined in `src/index.css`
- Tailwind CSS utilities are available throughout the app
- NextUI components can be customized using their theming system

### Adding New Device Types
1. Update the `Device` interface if needed
2. Add new devices to the mock data array
3. The dashboard will automatically display new devices

## Future Enhancements

- [ ] Real-time data integration
- [ ] Interactive charts and graphs
- [ ] Device configuration management
- [ ] Alert management system
- [ ] User authentication
- [ ] Multi-tenant support
- [ ] API integration
- [ ] Export functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 