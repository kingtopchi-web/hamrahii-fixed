// src/services/ReportService.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class ReportService {
  // Export dashboard data to Excel
  static exportDashboardReport(dashboardData, timeRange = 'week') {
    try {
      const wb = XLSX.utils.book_new();
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Sheet 1: Overview Metrics
      const overviewData = this.formatOverviewData(dashboardData.overview);
      const ws1 = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Overview');
      
      // Sheet 2: Recent Rides
      if (dashboardData.recentRides && dashboardData.recentRides.length > 0) {
        const ridesData = this.formatRidesData(dashboardData.recentRides);
        const ws2 = XLSX.utils.json_to_sheet(ridesData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Recent Rides');
      }
      
      // Sheet 3: Popular Routes
      if (dashboardData.popularRoutes && dashboardData.popularRoutes.length > 0) {
        const routesData = this.formatRoutesData(dashboardData.popularRoutes);
        const ws3 = XLSX.utils.json_to_sheet(routesData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Popular Routes');
      }
      
      // Sheet 4: Driver Stats
      if (dashboardData.driverStats && dashboardData.driverStats.length > 0) {
        const driversData = this.formatDriversData(dashboardData.driverStats);
        const ws4 = XLSX.utils.json_to_sheet(driversData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Top Drivers');
      }
      
      // Sheet 5: Revenue Analytics
      if (dashboardData.revenueData && dashboardData.revenueData.length > 0) {
        const revenueData = this.formatRevenueData(dashboardData.revenueData);
        const ws5 = XLSX.utils.json_to_sheet(revenueData);
        XLSX.utils.book_append_sheet(wb, ws5, 'Revenue Analytics');
      }
      
      // Sheet 6: Performance Metrics
      if (dashboardData.performanceMetrics && Object.keys(dashboardData.performanceMetrics).length > 0) {
        const perfData = this.formatPerformanceData(dashboardData.performanceMetrics);
        const ws6 = XLSX.utils.json_to_sheet(perfData);
        XLSX.utils.book_append_sheet(wb, ws6, 'Performance');
      }
      
      // Add summary sheet
      const summaryData = this.createSummarySheet(dashboardData, timeRange);
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
      
      // Generate filename with timestamp
      const filename = `Dashboard_Report_${timestamp}_${timeRange}.xlsx`;
      
      // Write and download file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, filename);
      
      return { success: true, filename };
    } catch (error) {
      // console.error('Error exporting report:', error);
      return { success: false, error: error.message };
    }
  }

  static formatOverviewData(overview) {
    return [
      { 'Metric': 'Total Rides', 'Value': overview.totalRides || 0 },
      { 'Metric': 'Active Users', 'Value': overview.activeDrivers || 0 },
      { 'Metric': 'Total Users', 'Value': overview.totalUsers || 0 },
      { 'Metric': 'Total Revenue', 'Value': `₹${overview.totalRevenue?.toLocaleString() || 0}` },
      { 'Metric': "Today's Rides", 'Value': overview.todayRides || 0 },
      { 'Metric': 'Pending Requests', 'Value': overview.pendingRequests || 0 },
      { 'Metric': 'Occupancy Rate', 'Value': `${overview.occupancyRate || 0}%` },
      { 'Metric': 'Average Rating', 'Value': overview.avgRating || 0 },
      { 'Metric': 'Total Drivers', 'Value': overview.totalDrivers || 0 },
      { 'Metric': 'Total Bookings', 'Value': overview.totalBookings || 0 },
      { 'Metric': "Today's Bookings", 'Value': overview.todayBookings || 0 },
      { 'Metric': "Today's Revenue", 'Value': `₹${overview.todayRevenue?.toLocaleString() || 0}` },
      { 'Metric': 'Upcoming Rides', 'Value': overview.upcomingRides || 0 },
      { 'Metric': 'Total Seats', 'Value': overview.totalSeats || 0 },
      { 'Metric': 'Total Seats Today', 'Value': overview.totalSeatsForToday || 0 },
      { 'Metric': 'Booked Seats Today', 'Value': overview.bookedSeatsToday || 0 },
      { 'Metric': 'Ride Growth', 'Value': `${overview.rideGrowth || 0}%` },
      { 'Metric': 'Report Generated', 'Value': new Date().toLocaleString() },
    ];
  }

    static formatRidesData(rides) {
      return rides.map((ride, index) => {
        const bookedSeats = ride.bookedSeats || (ride.totalSeats - ride.availableSeats) || 0;
        const totalAmount = ride.totalAmount || (ride.pricePerSeat * bookedSeats) || 0;
        const departureTime = ride.departureTime ? new Date(ride.departureTime) : null;

        
        return {
          'S.No': index + 1,
          'Ride ID': ride._id || 'N/A',
          'From': ride.from?.city || ride.from || 'Unknown',
          'To': ride.to?.city || ride.to || 'Unknown',
          'Departure Date': departureTime ? departureTime.toLocaleDateString() : 'N/A',
          'Departure Time': departureTime ? departureTime.toLocaleTimeString() : 'N/A',
          'Driver': ride.driver?.firstName + ' ' + ride.driver?.lastName || 'Unknown Driver',
          'Driver Rating': ride.driver?.rating || 'New',
          'Price Per Seat': `₹${ride.pricePerSeat || 0}`,
          'Total Seats': ride.totalSeats || 0,
          'Available Seats': ride.availableSeats || 0,
          'Booked Seats': bookedSeats,
          'Total Amount': `₹${totalAmount}`,
          'Status': ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : 'Upcoming',
          'Vehicle Brand': ride?.carDetails?.brand || 'N/A',
          'Vehicle Number': ride?.carDetails?.plateNumber || 'N/A',
          'Vehicle Model': ride?.carDetails?.model || 'N/A',
          'Vehicl fuel type': ride?.carDetails?.fuelType || 'N/A',
          'Created At': ride.createdAt ? new Date(ride.createdAt).toLocaleString() : 'N/A',
        };
      });
    }

  static formatRoutesData(routes) {
    return routes.map((route, index) => ({
      'Rank': index + 1,
      'Route': `${route.from || 'Unknown'} → ${route.to || 'Unknown'}`,
      'Total Rides': route.rides || 0,
      'Total Bookings': route.bookings || 0,
      'Average Price': `₹${route.avgPrice?.toFixed(0) || 0}`,
      'Total Revenue': `₹${route.totalRevenue || 0}`,
      'Popularity Score': route.popularityScore || 'N/A',
    }));
  }

  static formatDriversData(drivers) {
    return drivers.map((driver, index) => ({
      'Rank': index + 1,
      'Driver ID': driver._id || 'N/A',
      'Driver Name': driver.name || 'Unknown Driver',
      'Total Rides': driver.totalRides || 0,
      'Completed Rides': driver.completedRides || 0,
      'Earnings': `₹${driver.earnings?.toLocaleString() || 0}`,
      'Rating': driver.rating?.toFixed(1) || 'New',
      'Vehicle Model': driver.vehicleModel || 'N/A',
      'Vehicle Number': driver.vehicleNumber || 'N/A',
      'Join Date': driver.joinDate ? new Date(driver.joinDate).toLocaleDateString() : 'N/A',
      'Status': driver.status || 'Active',
    }));
  }

  static formatRevenueData(revenueData) {
    const data = revenueData.revenueData || revenueData || [];
    return data.map((item, index) => ({
      'Period': item.day || item.date || `Day ${index + 1}`,
      'Revenue': `₹${(item.revenue || item.amount || 0).toLocaleString()}`,
      'Bookings': item.bookings || 0,
      'Average Booking Value': `₹${item.avgBookingValue?.toFixed(0) || 0}`,
      'Growth %': item.growth ? `${item.growth}%` : '0%',
    }));
  }

  static formatPerformanceData(performance) {
    const metrics = performance.metrics || performance || {};
    return [
      { 'Metric': 'Ride Growth', 'Value': `${metrics.rideGrowth?.toFixed(1) || '0.0'}%` },
      { 'Metric': 'Today Upcoming Rides %', 'Value': `${metrics.todayUpcomingRidePercentage || '0'}%` },
      { 'Metric': 'Current Week Rides', 'Value': metrics.currentWeekRides || '0' },
      { 'Metric': 'Previous Week Rides', 'Value': metrics.previousWeekRides || '0' },
      { 'Metric': 'Week-over-Week Growth', 'Value': metrics.weekOverWeekGrowth ? `${metrics.weekOverWeekGrowth}%` : '0%' },
      { 'Metric': 'Avg. Ride Completion Rate', 'Value': `${metrics.avgCompletionRate || '0'}%` },
      { 'Metric': 'Avg. Driver Rating', 'Value': metrics.avgDriverRating?.toFixed(1) || '0.0' },
      { 'Metric': 'Customer Satisfaction', 'Value': `${metrics.customerSatisfaction || '0'}%` },
    ];
  }

  static createSummarySheet(dashboardData, timeRange) {
    const summary = [
      { 'Category': 'Report Summary', 'Value': '' },
      { 'Category': 'Report Period', 'Value': timeRange.charAt(0).toUpperCase() + timeRange.slice(1) },
      { 'Category': 'Generated On', 'Value': new Date().toLocaleString() },
      { 'Category': '', 'Value': '' },
      { 'Category': 'Key Metrics', 'Value': '' },
      { 'Category': 'Total Revenue', 'Value': `₹${dashboardData.overview.totalRevenue?.toLocaleString() || '0'}` },
      { 'Category': 'Total Rides', 'Value': dashboardData.overview.totalRides || '0' },
      { 'Category': 'Active Users', 'Value': dashboardData.overview.activeDrivers || '0' },
      { 'Category': 'Seat Occupancy Rate', 'Value': `${dashboardData.overview.occupancyRate || '0'}%` },
      { 'Category': '', 'Value': '' },
      { 'Category': 'Performance Highlights', 'Value': '' },
      { 'Category': 'Ride Growth', 'Value': `${dashboardData.overview.rideGrowth || '0'}%` },
      { 'Category': 'Total Bookings Today', 'Value': dashboardData.overview.todayBookings || '0' },
      { 'Category': 'Revenue Today', 'Value': `₹${dashboardData.overview.todayRevenue?.toLocaleString() || '0'}` },
      { 'Category': 'Upcoming Rides', 'Value': dashboardData.overview.upcomingRides || '0' },
      { 'Category': '', 'Value': '' },
      { 'Category': 'Data Points Included', 'Value': '' },
      { 'Category': 'Recent Rides', 'Value': dashboardData.recentRides?.length || 0 },
      { 'Category': 'Popular Routes', 'Value': dashboardData.popularRoutes?.length || 0 },
      { 'Category': 'Top Drivers', 'Value': dashboardData.driverStats?.length || 0 },
      { 'Category': 'Revenue Data Points', 'Value': dashboardData.revenueData?.length || 0 },
    ];
    
    return summary;
  }

  // Export specific data type
  static exportSpecificData(data, dataType, filename) {
    try {
      const wb = XLSX.utils.book_new();
      let sheetData = [];
      let sheetName = 'Data';
      
      switch (dataType) {
        case 'rides':
          sheetData = this.formatRidesData(data);
          sheetName = 'Rides Report';
          break;
        case 'drivers':
          sheetData = this.formatDriversData(data);
          sheetName = 'Drivers Report';
          break;
        case 'routes':
          sheetData = this.formatRoutesData(data);
          sheetName = 'Routes Report';
          break;
        case 'revenue':
          sheetData = this.formatRevenueData(data);
          sheetName = 'Revenue Report';
          break;
        case 'overview':
          sheetData = this.formatOverviewData(data);
          sheetName = 'Overview Report';
          break;
        default:
          sheetData = Array.isArray(data) ? data : [data];
      }
      
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Add timestamp
      const timestampSheet = XLSX.utils.json_to_sheet([
        { 'Report Type': sheetName },
        { 'Generated On': new Date().toLocaleString() },
        { 'Total Records': sheetData.length }
      ]);
      XLSX.utils.book_append_sheet(wb, timestampSheet, 'Info');
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const finalFilename = filename || `${dataType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, finalFilename);
      
      return { success: true, filename: finalFilename };
    } catch (error) {
      // console.error(`Error exporting ${dataType} data:`, error);
      return { success: false, error: error.message };
    }
  }

  // Export to CSV (alternative format)
  static exportToCSV(data, filename) {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, filename || `report_${new Date().toISOString().split('T')[0]}.csv`);
      return { success: true };
    } catch (error) {
      // console.error('Error exporting CSV:', error);
      return { success: false, error: error.message };
    }
  }
}

export default ReportService;